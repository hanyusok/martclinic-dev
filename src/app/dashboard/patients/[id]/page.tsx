'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Patient {
  id: string
  fullName: string
  dateOfBirth: string
  gender: string
  phoneNumber?: string
  email?: string
  address?: string
  medicalHistory?: string
  createdAt: string
  recordNumber?: string
}

interface Report {
  id: string
  examinationDate: string
  findings: string
  impression: string
  recommendations?: string
  doctor: {
    name: string
  }
}

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPatientData()
  }, [params.id])

  const fetchPatientData = async () => {
    try {
      setIsLoading(true)
      // Fetch patient details
      const patientResponse = await fetch(`/api/patients/${params.id}`)
      if (!patientResponse.ok) throw new Error('Failed to fetch patient')
      const patientData = await patientResponse.json()
      setPatient(patientData)

      // Fetch patient's reports
      const reportsResponse = await fetch(`/api/reports?patientId=${params.id}`)
      if (!reportsResponse.ok) throw new Error('Failed to fetch reports')
      const reportsData = await reportsResponse.json()
      setReports(reportsData)
    } catch (err) {
      setError('Failed to load patient data')
      console.error('Error fetching patient data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading patient information...</div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-500">{error || 'Patient not found'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              {patient.fullName}
            </h1>
            <div className="flex space-x-4">
              <Link
                href="/dashboard/patients"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                List
              </Link>
              <Link
                href={`/dashboard/reports/new?patientId=${patient.id}`}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                New Report
              </Link>
              <Link
                href={`/dashboard/patients/${patient.id}/edit`}
                className="bg-yellow-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-600"
              >
                Edit
              </Link>
              <button
                onClick={() => router.back()}
                className="bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          </div>

          {/* Patient Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Patient Information</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {patient.fullName}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(patient.dateOfBirth).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="mt-1 text-sm text-gray-900">{patient.gender}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{patient.phoneNumber || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{patient.email || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{patient.address || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">환자번호</dt>
                  <dd className="mt-1 text-sm text-gray-900">{patient.recordNumber || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Medical History</dt>
                  <dd className="mt-1 text-sm text-gray-900">{patient.medicalHistory || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Reports */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Reports</h2>
            </div>
            <div className="border-t border-gray-200">
              {reports.length === 0 ? (
                <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                  No reports found for this patient.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {reports.map((report) => (
                    <li key={report.id}>
                      <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">
                              Examination Date: {new Date(report.examinationDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              Doctor: {report.doctor.name}
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              Impression: {report.impression}
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0 flex space-x-4">
                            <Link
                              href={`/dashboard/reports/${report.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </Link>
                            <Link
                              href={`/dashboard/reports/${report.id}/print`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Print
                            </Link>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 