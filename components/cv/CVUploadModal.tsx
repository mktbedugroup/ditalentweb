import React, { useState } from 'react';
import { Button } from '../common/Button';

interface CVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string, email: string, cvBase64: string, fileName: string }) => Promise<void>;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const CVUploadModal: React.FC<CVUploadModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !file) {
      setError('Por favor, completa todos los campos y selecciona un archivo.');
      return;
    }

    setLoading(true);
    try {
      const cvBase64 = await fileToBase64(file);
      await onSubmit({ name, email, cvBase64, fileName });
    } catch (err) {
      setError('Hubo un error al procesar el archivo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold">Enviar CV</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Adjuntar CV (PDF, DOC, DOCX, JPG)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Sube un archivo</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg" />
                        </label>
                        <p className="pl-1">o arrástralo aquí</p>
                    </div>
                    {fileName && <p className="text-sm text-gray-500">{fileName}</p>}
                </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" isLoading={loading}>Enviar</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CVUploadModal;
