This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## PostgreSQL Database

This project uses PostgreSQL as its database. The database is set up with the following tables:

- **User:** Contains user information with roles (ADMIN, DOCTOR, NURSE).
- **Patient:** Contains patient information including personal and medical history.
- **Report:** Contains medical reports linked to patients and doctors.

### Database Setup

1. Ensure PostgreSQL is installed and running on your system.
2. Create a database named `martclinic`.
3. Configure your `.env` file with the following:
   ```
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/martclinic"
   ```
4. Run the Prisma migrations to set up the database schema:
   ```bash
   npx prisma migrate dev
   ```

### Seed Data

The database can be populated with sample data using the seed script:
```bash
node prisma/seed.js
```

This will create 3 users, 5 patients, and 20 reports in the database.
