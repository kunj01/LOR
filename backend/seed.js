import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create a test admin user
  const adminPassword = bcrypt.hashSync("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { id: "ADMIN001" },
    update: {},
    create: {
      id: "ADMIN001",
      email: "admin@example.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create a test student user
  const studentPassword = bcrypt.hashSync("student123", 10);
  const student = await prisma.user.upsert({
    where: { id: "STUDENT001" },
    update: {},
    create: {
      id: "STUDENT001",
      email: "student@example.com",
      name: "Student User",
      password: studentPassword,
      role: "STUDENT",
    },
  });

  console.log("Seed data created:");
  console.log("Admin:", admin);
  console.log("Student:", student);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
