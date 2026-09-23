import { defineConfig } from "drizzle-kit";
import path from "path";

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.js"),
  dialect: "postgresql",
  dbCredentials: {
    // Set DATABASE_URL in your .env file
    // Example: postgresql://user:password@localhost:5432/satyacheck
    url: process.env.DATABASE_URL,
  },
});
