import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Add connection timeout and retry logic
const sql = neon(process.env.DATABASE_URL, {
  // Add fetch options for timeout
  fetchOptions: {
    // Set timeout to 10 seconds
    timeout: 10000,
  }
});

export const db = drizzle(sql, {
  // Add logger for debugging
  logger: process.env.NODE_ENV === 'development'
});