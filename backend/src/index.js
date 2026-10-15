const http = require('http');
const cors = require('cors');

const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const socketIo = require('./socket/io');
const { getConnection } = require('./lib/redisConnection');

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(async () => {
  console.log('Connected to MongoDB');

  // Provision the Vexa owner account from Railway variables.
  const adminEmail = process.env.VEXA_ADMIN_EMAIL;
  const adminUsername = process.env.VEXA_ADMIN_USERNAME || 'Vexa';
  const adminPassword = process.env.VEXA_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const { User } = require('./models');
    let admin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!admin) {
      admin = await User.create({
        username: adminUsername,
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        role: 'admin',
        isEmailVerified: true,
        isVerifiedBadge: true,
        shortId: String(Math.floor(1000 + Math.random() * 9000)),
        color: 'green',
      });
      console.log('Vexa owner account created');
    } else {
      admin.username = adminUsername;
      admin.role = 'admin';
      admin.isEmailVerified = true;
      admin.isVerifiedBadge = true;
      if (process.env.VEXA_ADMIN_SYNC_PASSWORD === 'true') admin.password = adminPassword;
      await admin.save();
      console.log('Vexa owner account verified and promoted');
    }
  } else {
    console.warn('VEXA_ADMIN_EMAIL or VEXA_ADMIN_PASSWORD is missing; owner bootstrap skipped');
  }

  server = http.createServer({}, app);

  // init redis connection
  getConnection();

  // init socket
  socketIo.setup(server, cors);

  server.listen(config.port, () => {
    console.info(`--- 🌟  Started --- http://localhost:${config.port}`);
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  console.log(error);
  // exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  // if (server) {
  //   server.close();
  // }
});
