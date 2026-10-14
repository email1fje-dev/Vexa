const mongoose = require('mongoose');
const ShortUniqueId = require('short-unique-id');
const config = require('../src/config/config');
const { User } = require('../src/models');
const { COLORS } = require('../src/config/constants/modelsConstants');

const uid = new ShortUniqueId({ length: 4, dictionary: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] });

async function main() {
  const email = (process.env.OWNER_EMAIL || '').trim().toLowerCase();
  const password = process.env.OWNER_PASSWORD || '';

  if (!email || !password) {
    throw new Error('Set OWNER_EMAIL and OWNER_PASSWORD in the environment before running this script.');
  }
  if (password.length < 8) {
    throw new Error('OWNER_PASSWORD must be at least 8 characters. Use a new, unique password.');
  }

  await mongoose.connect(config.mongoose.url, config.mongoose.options);

  let user = await User.findOne({ email });
  if (!user) {
    user = new User({
      email,
      username: 'Vexa',
      password,
      role: 'admin',
      isEmailVerified: true,
      isVerifiedBadge: true,
      shortId: uid(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
  } else {
    user.username = 'Vexa';
    user.password = password;
    user.role = 'admin';
    user.isEmailVerified = true;
    user.isVerifiedBadge = true;
    if (!user.shortId) user.shortId = uid();
    if (!user.color) user.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  await user.save();
  console.log('Owner account is ready:', user.email, '| username: Vexa | role: admin | verified badge: enabled');
}

main()
  .catch((error) => {
    console.error('Owner account setup failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
