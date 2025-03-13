import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pdfs',
        resource_type: 'raw',
        allowed_formats: ['pdf'],
        public_id: (req, file) => `pdf-${Date.now()}-${file.originalname}`
    }
});

// Create multer upload middleware
const uploadPDF = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Limit file size to 10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
}).single('pdf');

// Function to upload PDF
const uploadPDFToCloudinary = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file.path, {
            resource_type: 'raw',
            folder: 'pdfs'
        });
        return {
            success: true,
            url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

export { 
    uploadPDF, 
    uploadPDFToCloudinary 
};