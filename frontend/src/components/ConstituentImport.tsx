import React, { useState } from 'react';

interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}

interface ConstituentImportProps {
  onImportComplete: () => void;
  token: string;
}

const ConstituentImport: React.FC<ConstituentImportProps> = ({ onImportComplete, token }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/constituents/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();
      setResult(data.details);
      if (data.details.successful > 0) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setResult({
        total: 0,
        successful: 0,
        failed: 1,
        errors: ['Failed to upload file']
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Import Constituents</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`px-4 py-2 rounded-md text-white font-medium
              ${!file || isUploading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {result && (
          <div className={`mt-4 p-4 rounded-md ${
            result.failed === 0 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
          }`}>
            <p className="font-medium">
              Import completed: {result.successful} successful, {result.failed} failed
            </p>
            {result.errors.length > 0 && (
              <ul className="mt-2 list-disc list-inside">
                {result.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstituentImport; 