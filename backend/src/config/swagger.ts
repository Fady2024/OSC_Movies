import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import fs from "fs";
import path from "path";
import YAML from "yaml";

const swaggerDir = path.resolve(__dirname, "../../swagger");

function loadYamlFiles(): Record<string, unknown> {
  const paths: Record<string, unknown> = {};
  const files = fs.readdirSync(swaggerDir).filter((f) => f.endsWith(".yaml"));
  for (const file of files) {
    const filePath = path.join(swaggerDir, file);
    const content = fs.readFileSync(filePath, "utf8");
    const parsed = YAML.parse(content) as Record<string, unknown>;
    Object.assign(paths, parsed);
  }
  return paths;
}

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Cinema Booking API",
    version: "1.0.0",
    description: "API for managing cinema shows, seats, and ticket bookings.",
  },
  servers: [{ url: "/api/v1" }, { url: "/api" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: loadYamlFiles(),
};

export function setupSwagger(app: Express): void {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger docs available at /api/v1/docs");
}
