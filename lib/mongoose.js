const mongoose = require('mongoose');

let isConnected = false;

exports.connectToDB = async () => {
  mongoose.set('strictQuery', true);

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined');
    throw new Error('MONGODB_URI is not defined');
  }

  if (isConnected) {
    console.log('=> using existing database connection');
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'pricewise',
      bufferCommands: false,
    });

    isConnected = true;
    console.log('MongoDB Connected');
    return db;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    throw error;
  }
};
