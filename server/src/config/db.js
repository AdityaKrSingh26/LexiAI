import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;

const connection = async () => {
    try {
        await mongoose.connect(MONGODB_URL, {
            useNewUrlParser: true,
            serverSelectionTimeoutMS: 5000,
            writeConcern: { w: 'majority' } 
        });

        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

// Remove deprecated `useCreateIndex` (no longer needed in Mongoose 6+)
export default connection;
