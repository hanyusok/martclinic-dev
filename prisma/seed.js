const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const faker = require('faker');

async function main() {
  // Create 3 doctors
  const doctorData = [
    {
      name: 'Dr. Kim Minsoo',
      email: 'kim.minsoo@example.com',
      password: await bcrypt.hash('password1', 10),
      role: 'DOCTOR',
      licenseNumber: faker.datatype.number({ min: 100000, max: 999999 }).toString(),
    },
    {
      name: 'Dr. Lee Jihye',
      email: 'lee.jihye@example.com',
      password: await bcrypt.hash('password2', 10),
      role: 'DOCTOR',
      licenseNumber: faker.datatype.number({ min: 100000, max: 999999 }).toString(),
    },
    {
      name: 'Dr. Park Jiwon',
      email: 'park.jiwon@example.com',
      password: await bcrypt.hash('password3', 10),
      role: 'DOCTOR',
      licenseNumber: faker.datatype.number({ min: 100000, max: 999999 }).toString(),
    },
  ];
  await prisma.user.createMany({ data: doctorData, skipDuplicates: true });
  const doctors = await prisma.user.findMany({ where: { role: 'DOCTOR' } });

  // Create 10 patients
  const patients = [];
  for (let i = 0; i < 10; i++) {
    const patient = await prisma.patient.create({
      data: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        dateOfBirth: faker.date.past(60, new Date(2010, 0, 1)),
        gender: faker.random.arrayElement(['MALE', 'FEMALE', 'OTHER']),
        phoneNumber: faker.phone.phoneNumber(),
        email: faker.internet.email(),
        address: faker.address.streetAddress(),
        medicalHistory: faker.lorem.sentence(),
        patientNumber: faker.datatype.uuid().slice(0, 8),
      },
    });
    patients.push(patient);
  }

  // Helper for random Korean hospital info
  function randomHospital() {
    return {
      institutionName: faker.company.companyName() + '의원',
      institutionAddress: faker.address.streetAddress() + ', ' + faker.address.cityName(),
      institutionPhone: faker.phone.phoneNumber('02-####-####'),
    };
  }

  // Create 24 reports
  for (let i = 0; i < 24; i++) {
    const patient = faker.random.arrayElement(patients);
    const doctor = faker.random.arrayElement(doctors);
    const hospital = randomHospital();
    const examType = faker.random.arrayElement(['GENERAL', 'DETAILED', 'LIMITED']);
    const examDate = faker.date.recent(60);
    const interpretationDate = faker.date.between(examDate, new Date());
    await prisma.report.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        institutionName: hospital.institutionName,
        institutionAddress: hospital.institutionAddress,
        institutionPhone: hospital.institutionPhone,
        examinationType: examType,
        examinationDate: examDate,
        interpretationDate: interpretationDate,
        liverEcho: faker.lorem.words(2),
        liverMass: faker.random.boolean() ? faker.lorem.words(3) : '',
        gallbladderAbnormal: faker.random.boolean() ? faker.lorem.words(3) : '',
        bileDuctDilation: faker.random.boolean() ? faker.lorem.words(3) : '',
        spleenEnlargement: faker.random.boolean() ? faker.lorem.words(3) : '',
        pancreasAbnormal: faker.random.boolean() ? faker.lorem.words(3) : '',
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