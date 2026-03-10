const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');

dotenv.config();

const FROM_EMAIL = 'tailoryash676@gmail.com';
const TO_EMAIL = 'b220670@skit.ac.in';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tribalmarketplace');
    console.log('Connected to MongoDB');

    const fromUser = await User.findOne({ email: FROM_EMAIL });
    if (!fromUser) {
      console.log(`No seller found with email ${FROM_EMAIL}. Nothing to move.`);
      process.exit(0);
    }

    let toUser = await User.findOne({ email: TO_EMAIL });
    if (!toUser) {
      console.log(`No user found with email ${TO_EMAIL}. Creating new seller user.`);
      toUser = new User({
        name: 'Tailor Seller',
        email: TO_EMAIL,
        password: process.env.TAILOR_TARGET_PASSWORD || 'seller123',
        role: 'seller',
        phone: '9999999997',
        sellerInfo: {
          businessName: 'Tailor Seller Studio',
          tribe: 'Tribal',
          region: 'India',
          verified: true
        }
      });
      await toUser.save();
    } else if (toUser.role !== 'seller') {
      console.log(`User ${TO_EMAIL} exists but is not a seller. Updating role to seller.`);
      toUser.role = 'seller';
      toUser.sellerInfo = toUser.sellerInfo || {
        businessName: 'Tailor Seller Studio',
        tribe: 'Tribal',
        region: 'India',
        verified: true
      };
      await toUser.save();
    }

    const result = await Product.updateMany(
      { seller: fromUser._id },
      { $set: { seller: toUser._id } }
    );

    console.log(
      `Moved ${result.modifiedCount || result.nModified || 0} products from ${FROM_EMAIL} to ${TO_EMAIL}`
    );
    process.exit(0);
  } catch (err) {
    console.error('Error moving tailor products:', err);
    process.exit(1);
  }
};

run();

