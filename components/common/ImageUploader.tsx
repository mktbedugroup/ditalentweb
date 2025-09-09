import React, { useState } from 'react';

interface ImageUploaderProps {
  initialValue?: string;
  onValueChange: (value: string) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ initialValue = '', onValueChange }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  // Use a separate state for URL input to avoid showing base64 string
  const [urlInput, setUrlInput] = useState(initialValue.startsWith('data:image') ? '' : initialValue);
  const [preview, setPreview] = useState(initialValue);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrlInput(newUrl);
    setPreview(newUrl);
    onValueChange(newUrl);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setPreview(base64);
        onValueChange(base64);
        setUrlInput(''); // Clear URL input if a file is uploaded
      } catch (error) {
        console.error("Error converting file to base64", error);
      }
    }
  };

  return (
    <div className="border border-gray-300 rounded-md mt-1">
      <div className="flex border-b">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 text-sm font-medium flex-1 rounded-tl-md ${activeTab === 'upload' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Subir Archivo
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`px-4 py-2 text-sm font-medium flex-1 rounded-tr-md border-l border-gray-300 ${activeTab === 'url' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          URL de la Imagen
        </button>
      </div>
      <div className="p-4">
        {activeTab === 'upload' ? (
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        ) : (
          <input
            type="text"
            placeholder="https://example.com/image.png"
            value={urlInput}
            onChange={handleUrlChange}
            className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"
          />
        )}
      </div>
      {preview && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-2">Vista Previa:</p>
          <img src={preview} alt="Preview" className="h-32 w-auto rounded-md object-cover bg-gray-100" />
        </div>
      )}
    </div>
  );
};
