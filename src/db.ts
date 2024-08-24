import mongoose from 'mongoose';
import "dotenv/config"

const connectDB = async () => {
  
  try {
    const mongoUri = process.env.MONGO_DB;

    if (!mongoUri) {
      throw new Error('MongoDB connection URI is not defined in environment variables.');
    }

    await mongoose.connect(mongoUri);

    console.log('MongoDB connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();
