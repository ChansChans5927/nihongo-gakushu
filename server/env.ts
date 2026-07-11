import dotenv from "dotenv";

dotenv.config();

function requireSecret(name: string, minimumLength: number): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`[Configuration] ${name} environment variable is required.`);
  }

  if (value.length < minimumLength) {
    throw new Error(
      `[Configuration] ${name} must be at least ${minimumLength} characters long.`
    );
  }

  return value;
}

export const JWT_SECRET = requireSecret("JWT_SECRET", 32);
