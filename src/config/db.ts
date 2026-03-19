import { DataSource } from "typeorm";
import path from "path";

// Debug function to check paths
const getEntityPath = () => {
  const isProd = process.env.NODE_ENV === "production";
  let entityPath;
  if (isProd) {
    entityPath = path.join(__dirname, "../../dist/models/*.js");
  } else {
    entityPath = path.join(__dirname, "../models/*.ts");
  }

  return entityPath;
};

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "getmodpc",
  synchronize: true,
  ssl: {
    rejectUnauthorized: false,
  },
  logging: true,
  entities: [getEntityPath()],
  migrations: [],
  subscribers: [],
});

export const initializeDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected --", AppDataSource.options.database);
  } catch (error) {
    console.error("❌ Database connection failed", error);
  }
};
