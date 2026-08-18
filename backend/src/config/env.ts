import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

interface EnvConfig {
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  NODE_ENV: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PUBLISHABLE_KEY: string;
  CLIENT_URL: string;
  RESEND_API_KEY: string;
  ELASTICSEARCH_ENABLED: boolean;
  ELASTICSEARCH_NODE: string;
  ELASTICSEARCH_USERNAME?: string;
  ELASTICSEARCH_PASSWORD?: string;
  KIBANA_URL?: string;
  WEB_URL?: string;
}

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getMongoUri(): string {
  const fullUri = process.env.MONGODB_URI;
  if (fullUri && fullUri !== "Added the MongoDB URI for the production database connection") {
    return fullUri;
  }

  const username = process.env.MONGODB_USERNAME;
  const password = process.env.MONGODB_PASSWORD;
  if (username && password) {
    return `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@cluster0.mongodb.net/cinema?retryWrites=true&w=majority`;
  }

  return "mongodb://localhost:27017/cinema";
}

export const env: EnvConfig = {
  PORT: parseInt(getEnv("PORT", "5000"), 10),
  MONGODB_URI: getMongoUri(),
  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "7d"),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  STRIPE_SECRET_KEY: getEnv("STRIPE_SECRET_KEY", ""),
  STRIPE_WEBHOOK_SECRET: getEnv("STRIPE_WEBHOOK_SECRET", ""),
  STRIPE_PUBLISHABLE_KEY: getEnv("STRIPE_PUBLISHABLE_KEY", ""),
  CLIENT_URL: getEnv("CLIENT_URL", "http://localhost:5173"),
  RESEND_API_KEY: getEnv("RESEND_API_KEY"),
  ELASTICSEARCH_ENABLED: process.env.ELASTICSEARCH_ENABLED === "true",
  ELASTICSEARCH_NODE: getEnv("ELASTICSEARCH_NODE", "http://localhost:9200"),
  ELASTICSEARCH_USERNAME: process.env.ELASTICSEARCH_USERNAME,
  ELASTICSEARCH_PASSWORD: process.env.ELASTICSEARCH_PASSWORD,
  KIBANA_URL: process.env.KIBANA_URL,
  WEB_URL: process.env.WEB_URL,
};
