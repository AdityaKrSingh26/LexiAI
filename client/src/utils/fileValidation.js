import toast from 'react-hot-toast';

// File size constants
export const FILE_SIZE_LIMITS = {
    PDF_MAX_SIZE: 10 * 1024 * 1024, // 10MB in bytes
};

// File validation functions
export const validateFileSize = (file, maxSize = FILE_SIZE_LIMITS.PDF_MAX_SIZE) => {
    if (file.size > maxSize) {
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0);
        
        toast.error(`File too large! Size: ${fileSizeMB}MB. Maximum allowed: ${maxSizeMB}MB`, {
            duration: 6000,
            icon: '⚠️',
        });
        return false;
    }
    return true;
};

export const validateFileType = (file, allowedTypes = ['application/pdf']) => {
    if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type! Only PDF files are allowed.', {
            duration: 4000,
            icon: '❌',
        });
        return false;
    }
    return true;
};

export const validateFile = (file, options = {}) => {
    const {
        maxSize = FILE_SIZE_LIMITS.PDF_MAX_SIZE,
        allowedTypes = ['application/pdf']
    } = options;

    return validateFileType(file, allowedTypes) && validateFileSize(file, maxSize);
};

// Format file size for display
export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    
    // Show appropriate decimal places
    const formattedSize = size % 1 === 0 ? size.toFixed(0) : size.toFixed(1);
    return `${formattedSize} ${sizes[i]}`;
};

// Check if file exceeds size limit without showing toast (for silent validation)
export const isFileSizeValid = (file, maxSize = FILE_SIZE_LIMITS.PDF_MAX_SIZE) => {
    return file.size <= maxSize;
};

// Get file size in MB
export const getFileSizeMB = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2);
};
