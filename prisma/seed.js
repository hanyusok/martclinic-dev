const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const faker = require('faker');

async function main() {
  // Create users
  const users = await prisma.user.createMany({
    data: [
      { name: 'Dr. John Doe', email: 'doctor@example.com', password: 'password', role: 'DOCTOR' },
      { name: 'Nurse Jane Smith', email: 'nurse@example.com', password: 'password', role: 'NURSE' },
      { name: 'Admin Bob Brown', email: 'admin@example.com', password: 'password', role: 'ADMIN' },
    ],
    skipDuplicates: true,
  });

  // Fetch the doctor user for report assignment
  const doctor = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });

  // Create patients
  const patients = [];
  for (let i = 0; i < 5; i++) {
    const patient = await prisma.patient.create({
      data: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        dateOfBirth: faker.date.past(50, new Date(2005, 0, 1)),
        gender: faker.random.arrayElement(['MALE', 'FEMALE', 'OTHER']),
        phoneNumber: faker.phone.phoneNumber(),
        email: faker.internet.email(),
        address: faker.address.streetAddress(),
        medicalHistory: faker.lorem.sentence(),
      },
    });
    patients.push(patient);
  }

  // Create reports
  for (let i = 0; i < 20; i++) {
    const patient = faker.random.arrayElement(patients);
    await prisma.report.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        examinationDate: faker.date.recent(30),
        findings: faker.lorem.paragraph(),
        impression: faker.lorem.sentence(),
        recommendations: faker.lorem.sentence(),
        images: [faker.image.imageUrl(), faker.image.imageUrl()],
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 