module.exports = {
  apps: [{
    name: "cinema-api",
    script: "dist/server.js",
    instances: process.env.WEB_CONCURRENCY || "max",
    exec_mode: "cluster",
    autorestart: true,
    max_memory_restart: "500M",
    env_production: { NODE_ENV: "production" },
  }],
};
