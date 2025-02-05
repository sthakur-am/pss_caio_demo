import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFilesProcessed: (files: ProcessedFile[]) => void;
  existingFiles?: ProcessedFile[];
}

export interface ProcessedFile {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  uploadDate: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesProcessed, existingFiles = [] }) => {
  const [files, setFiles] = useState<ProcessedFile[]>(existingFiles);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    const processedFiles: ProcessedFile[] = [];
    const errors: string[] = [];

    try {
      for (const file of selectedFiles) {
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          errors.push(`${file.name} exceeds 10MB size limit`);
          continue;
        }

        // Check file type
        if (!file.type.match('text.*') && !file.type.match('application/json')) {
          errors.push(`${file.name} is not a supported file type`);
          continue;
        }

        try {
          const content = await file.text();
          processedFiles.push({
            id: crypto.randomUUID(),
            name: file.name,
            content,
            type: file.type,
            size: file.size,
            uploadDate: new Date().toISOString()
          });
        } catch (error) {
          errors.push(`Failed to read ${file.name}`);
        }
      }

      if (processedFiles.length > 0) {
        const newFiles = [...files, ...processedFiles];
        setFiles(newFiles);
        onFilesProcessed(newFiles);
        toast.success(`Successfully processed ${processedFiles.length} file(s)`);
      }

      if (errors.length > 0) {
        toast.error(errors.join('\n'));
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Failed to process files');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (id: string) => {
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    onFilesProcessed(newFiles);
    toast.success('File removed');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="flex flex-col items-center justify-center">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Upload additional context files (text or JSON only, max 10MB each)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            multiple
            accept=".txt,.json,.md"
            className="hidden"
            disabled={isProcessing}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </div>
            ) : (
              'Select Files'
            )}
          </button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="border rounded-lg divide-y">
          {files.map(file => (
            <div key={file.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(file.id)}
                className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};