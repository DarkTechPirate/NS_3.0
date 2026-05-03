module.exports = {
  apps: [
    {
      name: "api",
      script: "server.js",
      cwd: "/app/backend",
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT: "3002"
      }
    },
    {
      name: "worker",
      script: "workers/index.js",
      cwd: "/app/backend",
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "nginx",
      script: "nginx",
      args: "-g 'daemon off;'",
      exec_mode: "fork",
      instances: 1
    }
  ]
};
