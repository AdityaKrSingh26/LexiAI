import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import useChatStore from '../utils/chatStore';

const PDFUploader = () => {
  const {
    currentPdf,
    uploadPDF,
    isUploading,
    uploadProgress
  } = useChatStore();

  const user = JSON.parse(localStorage.getItem('user'));

  const shortenFileName = (fileName, maxLength = 30) => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split('.').pop();
    const name = fileName.substring(0, maxLength - extension.length - 3);
    return `${name}...${extension}`;
  };

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some(e => e.code === 'file-too-large')) {
        const fileSizeMB = (rejection.file.size / 1024 / 1024).toFixed(2);
        toast.error(`File too large! Size: ${fileSizeMB}MB. Maximum allowed: 10MB`, {
          duration: 6000,
          icon: '⚠️',
        });
        return;
      }
      if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
        toast.error('Invalid file type! Only PDF files are allowed.', {
          duration: 4000,
          icon: '❌',
        });
        return;
      }
    }

    const file = acceptedFiles[0];
    if (file?.type === 'application/pdf' && user) {
      try {
        await uploadPDF(file, user.id);
      } catch (error) {
        // Error handling is done in the store
      }
    }
  }, [uploadPDF, user]);

  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: isUploading,
    maxSize: 10 * 1024 * 1024, // 10MB limit
  });

  if (isUploading) {
    return (
      <div className="w-full max-w-2xl mx-auto mb-8">
        <div className="border-2 border-gray-600 rounded-lg p-8 text-center">
          <Loader className="mx-auto mb-4 animate-spin" size={32} />
          <p className="text-lg mb-2">Uploading PDF...</p>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">{uploadProgress}% complete</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {!currentPdf ? (
        <div
          {...getRootProps()}
          data-upload-trigger
          className={`border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer
            ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'hover:border-blue-500 hover:bg-blue-500/5'}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-4" size={32} />
          <p className="text-lg mb-2">Drop your PDF here, or click to select</p>
          <p className="text-sm text-gray-400">Only PDF files are supported (Max: 10MB)</p>
        </div>
      ) : (
        <div className=" w-[100%]">
          <div className="mb-4">
            <embed
              src={currentPdf.url}
              type="application/pdf"
              width="100%"
              height="400"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="w-[100%] flex items-center gap-3 justify-end">
              <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-4">
                <FileText
                  size={30}
                  className="text-blue-500 cursor-pointer"
                  onClick={() => window.open(currentPdf.url, '_blank')}
                />
                <div className="max-w-[calc(100%-80px)] overflow-hidden">
                  <h3 className="font-medium truncate">
                    {shortenFileName(currentPdf.title || currentPdf.name)}
                  </h3>
                  {/* <p className="text-sm text-gray-400">
                Size: {(currentPdf.size / 1024 / 1024).toFixed(2)} MB
              </p> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
};

export default PDFUploader;