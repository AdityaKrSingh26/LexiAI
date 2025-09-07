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
        resource_type: 'image', // Change from 'raw' to 'image'
        allowed_formats: ['pdf'],
        access_mode: 'public',
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
                        error: `File is too large. Maximum size allowed is 10MB. Your file is ${(req.file?.size / 1024 / 1024).toFixed(2)}MB.`
                    });
                }
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(400).json({
                        success: false,
                        error: 'Unexpected file field. Please upload a PDF file.'
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
        if (!file) {
            console.error('Invalid file object provided to uploadPDFToCloudinary');
            throw new Error('Invalid file: file object is missing');
        }

        // When using CloudinaryStorage with multer, the file is already uploaded
        // and we just need to return the result instead of uploading again
        if (file.path && file.path.includes('cloudinary')) {
            console.log(`File already uploaded to Cloudinary: ${file.path}`);
            return {
                success: true,
                url: file.path,
                public_id: file.filename || `pdf-${Date.now()}-${file.originalname}`,
                format: 'pdf',
                created_at: new Date().toISOString()
            };
        }

        // If we have a local file path (not a Cloudinary URL), continue with upload
        if (!file.path) {
            console.error('Invalid file object provided to uploadPDFToCloudinary');
            throw new Error('Invalid file: file path is missing');
        }

        // Verify credentials are set
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error('Cloudinary credentials missing or incomplete');
            throw new Error('Cloudinary credentials are not properly configured');
        }

        console.log(`Attempting to upload file from path: ${file.path}`);

        // Upload with detailed options
        const result = await cloudinary.uploader.upload(file.path, {
            resource_type: "image", // Change from "raw" to "image"
            folder: "pdfs",
            use_filename: true,
            unique_filename: false,
            access_mode: "public",
            type: "upload"
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

// Function to delete PDF from Cloudinary
const deleteFromCloudinary = async (publicId) => {
    try {
        console.log(`[deleteFromCloudinary] Attempting to delete: ${publicId}`);
        
        // Verify credentials are set
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error('Cloudinary credentials missing or incomplete');
            throw new Error('Cloudinary credentials are not properly configured');
        }

        // Delete the resource
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image" // Use "image" since PDFs are stored as image type
        });

        console.log(`[deleteFromCloudinary] Delete result:`, result);

        if (result.result === 'ok') {
            return {
                success: true,
                message: 'File deleted successfully from Cloudinary'
            };
        } else if (result.result === 'not found') {
            console.warn(`[deleteFromCloudinary] File not found in Cloudinary: ${publicId}`);
            return {
                success: true,
                message: 'File was already deleted or not found'
            };
        } else {
            return {
                success: false,
                error: `Delete failed with result: ${result.result}`
            };
        }
    } catch (error) {
        console.error('[deleteFromCloudinary] Error deleting from Cloudinary:', error);
        return {
            success: false,
            error: error.message || 'Delete from Cloudinary failed'
        };
    }
};

export {
    uploadPDF,
    uploadPDFWithErrorHandling,
    uploadPDFToCloudinary,
    deleteFromCloudinary
};