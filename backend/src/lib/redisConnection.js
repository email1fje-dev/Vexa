const redisObject = require('redis');

let subConnection;
let con;

const createConnection = function () {
  const redis = redisObject.createClient({
    url: process.env.REDIS_HOST,
  });

  redis.on('connect', function () {
    console.log('Connected to Redis');
  });
  redis.on('error', function (err) {
    console.error('Redis connection error:', err.message);
  });

  redis.connect().catch((err) => {
    console.error('Redis connect failed:', err.message);
  });

  return redis;
};

const createSubConnection = async function () {
  const redis = redisObject.createClient({ url: process.env.REDIS_HOST });
  redis.on('connect', function () {
    console.log('Redis subscribe connected');
  });
  redis.on('error', function (err) {
    console.error('Redis subscribe connection error:', err.message);
  });

  await redis.connect();
  return redis;
};

module.exports.getSubConnection = async function () {
  if (!subConnection) subConnection = await createSubConnection();
  return subConnection;
};

module.exports.getConnection = function () {
  if (!con) con = createConnection();
  return con;
};
