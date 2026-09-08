import { defineConfig } from '@prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: {
    kind: 'single',
    filePath: 'prisma/schema.prisma',
  },
  datasources: [
    {
      provider: 'postgresql',
      url: process.env.DATABASE_URL!,
    },
  ],
});