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

// Create multer upload middleware with improved error handling
const uploadPDF = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Limit file size to 10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            console.error(`File upload rejected: Invalid mimetype ${file.mimetype}`);
            cb(new Error(`Only PDF files are allowed! Received: ${file.mimetype}`), false);
        }
    }
}).single('pdf');

// Enhanced wrapper for multer middleware to provide better error handling
const uploadPDFWithErrorHandling = (req, res, next) => {
    uploadPDF(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred during upload
                console.error(`Multer upload error: ${err.code}`, err);
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(413).json({
                        success: false,
                        error: 'File is too large. Maximum size is 10MB.'
                    });
                }
            }
            console.error('PDF upload failed:', err);
            return res.status(400).json({ success: false, error: err.message });
        }
        next();
    });
};

// Function to upload PDF with enhanced error handling
const uploadPDFToCloudinary = async (file) => {
    try {
        // Input validation
        if (!file || !file.path) {
            console.error('Invalid file object provided to uploadPDFToCloudinary');
            throw new Error('Invalid file: file object or path is missing');
        }

        // Verify credentials are set
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error('Cloudinary credentials missing or incomplete');
            throw new Error('Cloudinary credentials are not properly configured');
        }

        console.log(`Attempting to upload file from path: ${file.path}`);

        // Upload with detailed options
        const result = await cloudinary.uploader.upload(file.path, {
            resource_type: 'raw',
            folder: 'pdfs',
            access_mode: 'public',
            unique_filename: true,
            use_filename: true,
            overwrite: false,
            invalidate: true
        });

        // Verify upload result
        if (!result || !result.secure_url) {
            console.error('Cloudinary upload failed - no valid result:', result);
            throw new Error('Upload failed - no URL received from Cloudinary');
        }

        console.log(`File successfully uploaded to Cloudinary: ${result.public_id}`);

        return {
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            created_at: result.created_at
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        // Add stack trace for better debugging
        console.error('Error stack:', error.stack);
        return {
            success: false,
            error: error.message || 'Upload to Cloudinary failed',
            details: error.stack
        };
    }
};

export {
    uploadPDF,
    uploadPDFWithErrorHandling,
    uploadPDFToCloudinary
};