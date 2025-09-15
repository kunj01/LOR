import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create sample batches (global, no class)
  const batch1 = await prisma.batch.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "2024",
      description: "2024 Batch"
    },
  });

  const batch2 = await prisma.batch.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "2023",
      description: "2023 Batch"
    },
  });

  const batch3 = await prisma.batch.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: "2025",
      description: "2025 Batch"
    },
  });

  // Create a test admin user
  const adminPassword = bcrypt.hashSync("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { id: "admin" },
    update: {},
    create: {
      id: "admin",
      email: "admin@example.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create a test student user
  const studentPassword = bcrypt.hashSync("student123", 10);
  const student = await prisma.user.upsert({
    where: { id: "student001" },
    update: {},
    create: {
      id: "student001",
      email: "student@example.com",
      name: "Student User",
      password: studentPassword,
      role: "STUDENT",
      batchId: 1,
    },
  });

  // Create a test teacher user
  const teacherPassword = bcrypt.hashSync("teacher123", 10);
  const teacher = await prisma.user.upsert({
    where: { id: "TEACHER001" },
    update: {},
    create: {
      id: "TEACHER001",
      email: "teacher@example.com",
      name: "Teacher User",
      password: teacherPassword,
      role: "TEACHER",
    },
  });

  // Ensure a demo StudentProfile exists for the student to prevent 404 on /student/profile
  await prisma.studentProfile.upsert({
    where: { userId: "student001" },
    update: {},
    create: {
      userId: "student001",
      studentId: "student001",
      studentFullName: "Student User",
      emailId: "student@example.com",
      admissionMonth: "July",
      admissionYear: 2024,
      candidateMobile: "9999999999",
      parentMobile: "8888888888",
      bondPeriodCompleted: true,
      placementThroughCDPC: false,
      letterHeadCount: 0,
    },
  });

  console.log("Seed data created:");
  console.log("Batches:", batch1, batch2, batch3);
  console.log("Admin:", admin);
  console.log("Student:", student);
  console.log("Teacher:", teacher);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
