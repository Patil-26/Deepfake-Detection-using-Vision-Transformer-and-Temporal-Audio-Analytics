import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGO_URI || 'mongodb+srv://atharvappatil2005_db_user:7mJIYPhDz1IVrErj@cluster0.h3gohlv.mongodb.net/deepguard?retryWrites=true&w=majority&appName=Cluster0';
    const conn = await mongoose.connect(dbUri, {
      family: 4
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Mongoose Connection Error]: ${error.message}`);
  }
};

export default connectDB;
