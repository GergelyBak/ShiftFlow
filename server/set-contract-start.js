require('dotenv').config();
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const result = await User.findOneAndUpdate(
    { email: 'bakgergely@gmail.com' },
    { $set: { contractStartDate: new Date('2026-06-01') } },
    { new: true }
  );

  if (result) {
    console.log('✅ contractStartDate set to 2026-06-01 for bakgergely@gmail.com');
  } else {
    console.log('❌ User not found');
  }

  await mongoose.disconnect();
}

run().catch(console.error);
