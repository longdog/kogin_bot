module.exports = {
  apps: [
    {
      name: "kogin",
      script: "./index.js",
      node_args: "-r dotenv/config",
      instances: "max",
      exec_mode: "cluster",
    },
  ],
};
