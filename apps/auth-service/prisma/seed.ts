// Email:
// admin@hrportal.com
// 
// Password:
// Admin@123
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@hrportal.com";

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (existingAdmin) {
    console.log("✅ Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 12);

  await prisma.user.create({
    data: {
      name: "System Administrator",
      email: adminEmail,
      passwordHash: hashedPassword,
      role: Role.Admin, // Change to Role.ADMIN if you update the enum
    },
  });

  console.log("✅ Admin account created");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });