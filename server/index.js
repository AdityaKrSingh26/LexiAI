import dotenv from "dotenv"
import connectDB from "./src/config/db.js";
import app from './src/app.js';
import { validateEnvironment } from './src/config/validateEnv.js';

dotenv.config({ path: './.env' });

// Validate environment variables before starting
validateEnvironment();

const PORT = process.env.PORT || 8000

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`⚙️ Server is running at port : ${PORT}`);
        })
    })
    .catch((err) => {
        console.log("MongoDB connection failed !!! ", err);
    })