import User from "./database/models/userModel";
import bcrypt from "bcrypt";
const adminSeeder = async (): Promise<void> => {
  const [data] = await User.findAll({
    where: {
      email: "p2admin@gmail.com",
    },
  });
  if (!data) {
    await User.create({
      email: "p2admin@gmail.com",
      username: "p2admin",
      password: bcrypt.hashSync("admin123", 8),
      role: "Admin",
    });
    console.log("Admin ceredentials seeded successfully!");
  } else {
    console.log("Admin ceredentials already seeded!");
  }
};

export default adminSeeder;
