# Ultrasound Report System

This is a [Next.js](https://nextjs.org) project for managing ultrasound reports in outpatient clinics.

## Features

- User authentication with role-based access (Admin, Doctor, Nurse)
- Patient management system
- Ultrasound report creation and management
- Image upload and storage
- Report printing functionality
- Search and filter capabilities

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: TailwindCSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd martclinic-dev
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/martclinic"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
# Create the database
sudo -u postgres createdb martclinic

# Run database migrations
npx prisma migrate dev

# Seed the database with initial data
node prisma/seed.js
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Schema

The database includes the following main tables:

- **User**: Contains user information with roles (ADMIN, DOCTOR, NURSE)
- **Patient**: Contains patient information including personal and medical history
- **Report**: Contains medical reports linked to patients and doctors

## Seed Data

The database comes pre-populated with the following seed data:

- 3 users with different roles:
  - Doctor (email: doctor@example.com, password: password)
  - Nurse (email: nurse@example.com, password: password)
  - Admin (email: admin@example.com, password: password)
- 5 sample patients with random data
- 20 sample reports linked to the patients

To reset the database with seed data:
```bash
npx prisma migrate reset
node prisma/seed.js
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

The application can be deployed on Vercel or any other platform that supports Next.js applications.

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
