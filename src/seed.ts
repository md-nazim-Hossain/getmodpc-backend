import { AppDataSource } from "./config/db";
import { Admin } from "./models/admin.model";

async function seed() {
  await AppDataSource.initialize();
  console.log("🌱 Starting seed...");

  // -----------------------------
  // Create Default Admin
  // -----------------------------
  const adminRepo = AppDataSource.getRepository(Admin);

  let admin = await adminRepo.findOne({
    where: { email: "superadmin@gmail.com" },
  });

  if (!admin) {
    admin = adminRepo.create({
      full_name: "Super Admin",
      email: "superadmin@gmail.com",
      password: "12345678",
    });
    await adminRepo.save(admin);
    console.log("✅ Admin user created with Super_Admin");
  } else {
    // update admin if needed
    await adminRepo.save(admin);
    console.log("✅ Admin user updated");
  }
  await AppDataSource.destroy();
  console.log("🌱 Seeding finished");
}

seed().catch((err) => {
  console.error("❌ Seeding error:", err);
  process.exit(1);
});
