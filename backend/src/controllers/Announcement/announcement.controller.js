const catchAsync = require('../../utils/catchAsync');
const { Announcement } = require('../../models');

const getActive = catchAsync(async (req, res) => {
  const now = new Date();
  const items = await Announcement.find({
    status: 'published',
    startsAt: { $lte: now },
    $or: [{ endsAt: null }, { endsAt: { $gt: now } }],
  }).select('title body type startsAt endsAt createdAt').sort({ createdAt: -1 }).limit(5).lean();
  res.set('Cache-Control', 'no-store');
  res.send(items);
});

module.exports = { getActive };
