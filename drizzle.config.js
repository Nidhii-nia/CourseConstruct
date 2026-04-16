import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load the environment variables from .env
dotenv.config();

export default defineConfig({
  schema: './config/schema.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});