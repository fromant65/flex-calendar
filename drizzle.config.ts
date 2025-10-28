import { config } from "dotenv";
import { type Config } from "drizzle-kit";

config(); // carga variables de entorno desde .env

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  tablesFilter: ["flex-calendar_*"],
} satisfies Config;
