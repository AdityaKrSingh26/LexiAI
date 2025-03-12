import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import useChatStore from '../store/chatStore';

const PDFUploader = () => {
  const { currentPdf, setPdf } = useChatStore();

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file?.type === 'application/pdf') {
      setPdf({
        file,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2), // Convert to MB
        lastModified: new Date(file.lastModified).toLocaleDateString()
      });
    }
  }, [setPdf]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

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
                <h3 className="font-medium">{currentPdf.name}</h3>
                <p className="text-sm text-gray-400">
                  {currentPdf.size} MB • Last modified: {currentPdf.lastModified}
                </p>
              </div>
            </div>
            <button
              onClick={() => setPdf(null)}
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