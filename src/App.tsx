import React, { useState, useEffect, useMemo } from 'react';
import { UploadModal } from './components/UploadModal';
import { Sidebar } from './components/Sidebar';
import { DocumentGrid } from './components/DocumentGrid';
import { loginWithGoogle, logout } from './services/authService';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { DocumentMeta } from './types';
import { Search, Upload, BookOpenText, LogOut, CheckCircle2 } from 'lucide-react';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedNiveau, setSelectedNiveau] = useState<string | null>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<string | null>(null);

  const [dbConnected, setDbConnected] = useState<boolean>(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setDocuments([]);
      setLoadingDocs(false);
      return;
    }

    setLoadingDocs(true);
    const path = `users/${user.uid}/documents`;
    const docsRef = collection(db, path);
    // Real time sync. We use descending to show newest first.
    const q = query(docsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsData: DocumentMeta[] = [];
      snapshot.forEach(doc => {
        docsData.push(doc.data() as DocumentMeta);
      });
      setDocuments(docsData);
      setLoadingDocs(false);
      setDbConnected(true);
    }, (error) => {
      // Offline mode check or permission denied
      console.warn("Firestore access error:", error);
      if (error instanceof Error && error.message.includes('offline')) {
        setDbConnected(false);
      }
      setLoadingDocs(false);
      // We don't want to throw for offline mode here to allow UI to show offline state
      // handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchNiveau = selectedNiveau ? doc.niveau === selectedNiveau : true;
      const matchMatiere = selectedMatiere ? doc.matiere === selectedMatiere : true;
      const matchSearch = doc.originalName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchNiveau && matchMatiere && matchSearch;
    });
  }, [documents, selectedNiveau, selectedMatiere, searchQuery]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-2 bg-blue-500" />
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpenText className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EduDoc Manager</h1>
          <p className="text-gray-500 mb-8 text-sm">Votre espace centralisé pour classer et retrouver vos documents scolaires en un clin d'œil.</p>
          <button 
            onClick={loginWithGoogle}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-md shadow-blue-200 flex items-center justify-center"
          >
            Se connecter avec Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
            <BookOpenText className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 hidden sm:block">EduDoc</h1>
        </div>
        
        <div className="flex-1 max-w-2xl mx-6">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Rechercher un document..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl py-2.5 pl-10 pr-4 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md shadow-blue-200"
          >
            <Upload className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Importer PDF</span>
          </button>
          
          <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
          
          <button 
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            onClick={logout}
            title="Se déconnecter"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          selectedNiveau={selectedNiveau} 
          selectedMatiere={selectedMatiere}
          onSelectNiveau={setSelectedNiveau}
          onSelectMatiere={setSelectedMatiere}
        />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Vos documents</h2>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {filteredDocuments.length} {filteredDocuments.length > 1 ? 'fichiers' : 'fichier'}
              </span>
            </div>
            
            <DocumentGrid documents={filteredDocuments} loading={loadingDocs} />
          </div>
        </main>
      </div>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={() => console.log('Upload success')}
      />
    </div>
  );
}
