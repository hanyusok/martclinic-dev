# Authorization Implementation for Doctor Users

## Overview

This document outlines the authorization system implemented to ensure that doctor users can only access their own patients and records. The system has been designed to provide proper data isolation between different doctors while maintaining flexibility for collaborative patient care.

## Authorization Rules

### 1. Patient Access Control

**Doctors can access patients if:**
- They created the patient (tracked via `createdBy` field)
- They have created reports for the patient (via `reports` relationship)

**API Endpoints Protected:**
- `GET /api/patients` - Returns only accessible patients
- `GET /api/patients/[id]` - Checks access before returning patient details
- `PUT /api/patients/[id]` - Checks access before allowing updates
- `DELETE /api/patients/[id]` - Checks access before allowing deletion
- `POST /api/patients` - Only doctors can create patients

### 2. Report Access Control

**Doctors can only access reports they created:**
- All report operations are restricted to the doctor who created the report
- Reports are automatically associated with the creating doctor via `doctorId` field

**API Endpoints Protected:**
- `GET /api/reports` - Returns only doctor's own reports
- `GET /api/reports/[id]` - Checks ownership before returning report
- `PUT /api/reports/[id]` - Checks ownership before allowing updates
- `DELETE /api/reports/[id]` - Checks ownership before allowing deletion
- `POST /api/reports` - Only doctors can create reports
- `GET /api/reports/recent` - Returns only doctor's recent reports

### 3. File Upload Control

**Only doctors can upload files:**
- `POST /api/upload` - Restricted to doctors only

### 4. Role-Based Access Control

**All protected endpoints check for:**
- Valid authentication (session exists)
- Doctor role (`session.user.role === 'DOCTOR'`)

## Database Schema Changes

### Patient Model Updates

```prisma
model Patient {
  // ... existing fields ...
  createdBy     String?   // ID of the doctor who created this patient
  createdByDoctor User?   @relation("PatientCreator", fields: [createdBy], references: [id])
  // ... existing fields ...
}
```

### User Model Updates

```prisma
model User {
  // ... existing fields ...
  createdPatients Patient[] @relation("PatientCreator")
  // ... existing fields ...
}
```

## Implementation Details

### 1. Patient Authorization Logic

```typescript
// Check if doctor has access to patient
const patientAccess = await prisma.patient.findFirst({
  where: {
    id: patientId,
    OR: [
      { createdBy: session.user.id }, // Patient created by this doctor
      {
        reports: {
          some: {
            doctorId: session.user.id, // Doctor has reports for this patient
          },
        },
      },
    ],
  },
});
```

### 2. Report Authorization Logic

```typescript
// Check if doctor owns the report
if (report.doctorId !== session.user.id) {
  return new NextResponse('Forbidden: You do not have access to this report', { status: 403 })
}
```

### 3. Role-Based Authorization

```typescript
// Only doctors can access protected endpoints
if (session.user.role !== 'DOCTOR') {
  return new NextResponse('Forbidden: Only doctors can access this resource', { status: 403 })
}
```

## API Endpoints Summary

### Protected Endpoints

| Endpoint | Method | Authorization Check |
|----------|--------|-------------------|
| `/api/patients` | GET | Doctor role + patient access |
| `/api/patients` | POST | Doctor role only |
| `/api/patients/[id]` | GET | Doctor role + patient access |
| `/api/patients/[id]` | PUT | Doctor role + patient access |
| `/api/patients/[id]` | DELETE | Doctor role + patient access |
| `/api/reports` | GET | Doctor role + own reports only |
| `/api/reports` | POST | Doctor role only |
| `/api/reports/[id]` | GET | Doctor role + report ownership |
| `/api/reports/[id]` | PUT | Doctor role + report ownership |
| `/api/reports/[id]` | DELETE | Doctor role + report ownership |
| `/api/reports/recent` | GET | Doctor role + own reports only |
| `/api/upload` | POST | Doctor role only |

### Public Endpoints

| Endpoint | Method | Authorization |
|----------|--------|---------------|
| `/api/auth/[...nextauth]` | GET/POST | Public (authentication) |
| `/api/profile` | GET/PUT | Authenticated users only |
| `/api/dashboard/stats` | GET | Doctor role + own stats |

## Security Features

### 1. Session Validation
- All protected endpoints validate user session
- Unauthorized requests return 401 status

### 2. Role-Based Access
- All medical data operations require DOCTOR role
- Non-doctor users receive 403 Forbidden responses

### 3. Resource Ownership
- Reports are strictly isolated by doctor ownership
- Patients are accessible based on creation or report relationship

### 4. Input Validation
- Required fields are validated before database operations
- File uploads are restricted to images with size limits

## Testing Results

The authorization system has been tested with the following scenarios:

✅ **Doctor 1 can access:**
- Patients they created (Patient 1)
- Patients they have reports for (Patient 2)
- Only their own reports (Reports 1 & 2)

✅ **Doctor 2 can access:**
- Patients they created (Patient 2)
- Patients they have reports for (Patient 3)
- Only their own reports (Report 3)

✅ **Data Isolation:**
- Doctors cannot access each other's reports
- Patient access is properly restricted
- No cross-contamination between doctor data

## Migration Notes

The implementation required a database migration to add the `createdBy` field to the Patient model:

```sql
-- Migration: 20250623084004_add_patient_creator
ALTER TABLE "Patient" ADD COLUMN "createdBy" TEXT;
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_createdBy_fkey" 
  FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

## Future Considerations

1. **Audit Logging**: Consider adding audit trails for data access
2. **Temporary Access**: Implement temporary access grants for consultations
3. **Patient Sharing**: Add explicit patient sharing between doctors
4. **Admin Override**: Consider admin role for system-wide access
5. **API Rate Limiting**: Implement rate limiting for security

## Conclusion

The authorization system successfully implements proper data isolation for doctor users while maintaining the flexibility needed for patient care. All API endpoints are properly protected, and the system ensures that doctors can only access their own patients and records. 