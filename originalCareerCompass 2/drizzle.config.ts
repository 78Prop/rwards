import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  driver: 'expo',
  dialect: 'sqlite',
  dbCredentials: {
    url: './mining.db'
  }
} satisfies Config;
