import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
    'MONGODB_URL',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];

export const validateEnvironment = () => {
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(envVar => console.error(`   - ${envVar}`));
        console.error('\nPlease add these to your .env file');
        process.exit(1);
    }
    
    console.log('✅ All required environment variables are set');
};
