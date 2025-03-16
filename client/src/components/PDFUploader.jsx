import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader } from 'lucide-react';
import useChatStore from '../utils/chatStore';

const PDFUploader = () => {
  const { currentPdf, uploadPDF, isUploading, uploadProgress } = useChatStore();
  const user = JSON.parse(localStorage.getItem('user'));

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file?.type === 'application/pdf' && user) {
      await uploadPDF(file, user.id);
    }
  }, [uploadPDF, user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: isUploading
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
          className={`border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer
            ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'hover:border-blue-500 hover:bg-blue-500/5'}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-4" size={32} />
          <p className="text-lg mb-2">Drop your PDF here, or click to select</p>
          <p className="text-sm text-gray-400">Only PDF files are supported</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-blue-500" />
              <div>
                <h3 className="font-medium">{currentPdf.title || currentPdf.name}</h3>
                <p className="text-sm text-gray-400">
                  Size: {(currentPdf.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => useChatStore.getState().setCurrentPdf(null)}
              className="p-2 hover:bg-gray-700 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;