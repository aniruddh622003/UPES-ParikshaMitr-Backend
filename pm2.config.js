module.exports = {
  apps: [
    {
      name: 'pariksha-backend',
      script: './dist/src/main.js',
      cwd: 'D:\\College\\Sem 8\\Major 2\\Backend',
      watch: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
