import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;

const connection = async () => {
    const URL = MONGODB_URL;

    try {
        await mongoose.connect(URL);
        console.log('Connected to the database');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

export default connection;