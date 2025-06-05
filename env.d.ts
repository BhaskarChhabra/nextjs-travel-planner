// env.d.ts or types/env.d.ts
namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    JWT_KEY: string;
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: string;
  }
}
