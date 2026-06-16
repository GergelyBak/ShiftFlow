require('dotenv').config();
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const result = await User.findOneAndUpdate(
    { email: 'bakgergely@gmail.com' },
    {
      $set: {
        contractStartDate: new Date('2026-06-01'),
        previousEmployeeType: 'minijob',
        previousHourlyRate: 16,
      },
    },
    { new: true }
  );

  if (result) {
    console.log('✅ Updated bakgergely@gmail.com:');
    console.log('   contractStartDate: 2026-06-01');
    console.log('   previousEmployeeType: minijob');
    console.log('   previousHourlyRate: 16€');
  } else {
    console.log('❌ User not found');
  }

  await mongoose.disconnect();
}

run().catch(console.error);
