import React, { useState, useEffect } from 'react';
import { Search, FileText, Download, Eye, Calendar, BookOpen, Layers, Target } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DocumentMeta } from '../types';
import { getPdfFile } from '../lib/localstore';
import { cn } from '../lib/utils';

export function DocumentGrid({ documents, loading }: { documents: DocumentMeta[], loading: boolean }) {
  
  const handlePreview = async (doc: DocumentMeta) => {
    try {
      const file = await getPdfFile(doc.fileKey);
      if (file) {
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank');
      } else {
        alert("Fichier introuvable localement. Il a pu être supprimé du cache.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ouverture du fichier.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-center">
        <FileText className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Aucun document trouvé</h3>
        <p className="text-gray-500 max-w-sm mt-1">Ajustez vos filtres ou importez un nouveau document PDF.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {documents.map((doc) => (
        <div 
          key={doc.id} 
          className="group relative flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
          {/* Top colored border map based on category - just visual flair */}
          <div className="h-2 w-full bg-blue-500" />
          
          <div className="p-5 flex-grow">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                {doc.niveau}
              </span>
            </div>
            
            <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1 truncate" title={doc.originalName}>
              {doc.originalName}
            </h3>
            
            <p className="text-xs text-gray-400 font-mono mb-4 truncate" title={doc.systemName}>
              {doc.systemName}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <BookOpen className="w-4 h-4 mr-2 opacity-50" />
                <span className="truncate">{doc.matiere}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Target className="w-4 h-4 mr-2 opacity-50" />
                <span className="truncate">{doc.categorie}</span>
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <Calendar className="w-4 h-4 mr-2 opacity-50" />
                <span className="truncate">{format(new Date(doc.createdAt), "d MMMM yyyy", { locale: fr })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 p-4 bg-gray-50/50">
            <button 
              onClick={() => handlePreview(doc)}
              className="flex flex-1 items-center justify-center py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              Aperçu
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
