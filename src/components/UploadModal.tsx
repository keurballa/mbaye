import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { MATIERES, NIVEAUX, CATEGORIES } from '../types';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { savePdfFile } from '../lib/localstore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { cn } from '../lib/utils';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [matiere, setMatiere] = useState(MATIERES[0]);
  const [niveau, setNiveau] = useState(NIVEAUX[0]);
  const [categorie, setCategorie] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Veuillez sélectionner au moins un fichier PDF.");
      return;
    }

    if (!auth.currentUser) {
      setError("Vous devez être connecté pour upload un fichier.");
      return;
    }

    setLoading(true);
    try {
      const safeNiveau = niveau.replace(/[^a-zA-Z0-9]/g, '');
      const safeMatiere = matiere.replace(/[^a-zA-Z0-9]/g, '');
      const safeCat = categorie.replace(/[^a-zA-Z0-9]/g, '');

      for (let i = 0; i < files.length; i++) {
        const currentFile = files[i];
        const originalName = currentFile.name;
        const safeOriginalName = originalName.replace(/[^a-zA-Z0-9.]/g, '_');
        
        const systemName = `${safeNiveau}_${safeMatiere}_${safeCat}_${safeOriginalName}`;
        
        const fileKey = `pdf_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}`;
        
        // Save local Blob
        await savePdfFile(fileKey, currentFile);

        // Save Metadata in Firestore
        const documentId = `doc_${Date.now()}_${i}`;
        const path = `users/${auth.currentUser.uid}/documents`;
        const docRef = doc(db, path, documentId);
        
        const now = Date.now();
        
        const meta = {
          id: documentId,
          userId: auth.currentUser.uid,
          originalName: originalName.substring(0, 300),
          systemName: systemName.substring(0, 300),
          matiere,
          niveau,
          categorie,
          fileKey,
          createdAt: now,
          updatedAt: now
        };

        await setDoc(docRef, meta).catch(err => handleFirestoreError(err, OperationType.CREATE, path));
      }
      
      onSuccess();
      setFiles([]);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de l'upload. " + err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Importer un document</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fichier PDF</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-500 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 font-medium text-center px-4">
                    {files.length > 0 
                      ? `${files.length} fichier(s) sélectionné(s)` 
                      : "Cliquez pour sélectionner un ou plusieurs PDF"}
                  </p>
                  {files.length > 0 && (
                    <p className="text-xs text-blue-500 truncate max-w-xs">{files.map(f => f.name).join(', ')}</p>
                  )}
                </div>
                <input type="file" className="hidden" accept=".pdf,application/pdf" multiple onChange={handleFileChange} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
              <select className="w-full rounded-lg border border-gray-300 p-2.5 text-sm" value={niveau} onChange={e => setNiveau(e.target.value)}>
                {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
              <select className="w-full rounded-lg border border-gray-300 p-2.5 text-sm" value={matiere} onChange={e => setMatiere(e.target.value)}>
                {MATIERES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select className="w-full rounded-lg border border-gray-300 p-2.5 text-sm" value={categorie} onChange={e => setCategorie(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            onClick={handleUpload}
            disabled={loading || files.length === 0}
            className={cn(
              "w-full rounded-xl mt-6 py-3 px-4 font-semibold text-white transition-all",
              loading || files.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200"
            )}
          >
            {loading ? "Enregistrement..." : `Enregistrer ${files.length > 1 ? 'les documents' : 'le document'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
