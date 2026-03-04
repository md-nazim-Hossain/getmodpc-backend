import { DataSource } from "typeorm";
import path from "path";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "getmodpc",
  synchronize: true,
  ssl: false,
  logging: false,
  entities: [
    process.env.NODE_ENV === "production"
      ? path.join(__dirname, "../../dist/models/*.js") // compiled JS in dist/models
      : path.join(__dirname, "../models/*.ts"), // TS in dev
  ],
  migrations: [
    process.env.NODE_ENV === "production"
      ? path.join(__dirname, "../../dist/migrations/*.js")
      : path.join(__dirname, "../migrations/*.ts"),
  ],
  subscribers: [],
});

export const initializeDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed", error);
  }
};
