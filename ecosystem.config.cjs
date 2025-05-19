module.exports = {
  apps: [
    {
      name: "api",
      cwd: "./",
      script: "./main.js",
      node_args: "--env-file=.env",
    },
  ],
};
