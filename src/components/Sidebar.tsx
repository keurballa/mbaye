import React from 'react';
import { MATIERES, NIVEAUX } from '../types';
import { Filter, GraduationCap, Book } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  selectedNiveau: string | null;
  selectedMatiere: string | null;
  onSelectNiveau: (n: string | null) => void;
  onSelectMatiere: (m: string | null) => void;
}

export function Sidebar({ selectedNiveau, selectedMatiere, onSelectNiveau, onSelectMatiere }: SidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white h-[calc(100vh-73px)] overflow-y-auto hidden md:block">
      <div className="p-6">
        <div className="flex items-center text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
          <Filter className="w-4 h-4 mr-2" />
          Filtres
        </div>

        <div className="mb-8">
          <div className="flex items-center text-sm font-semibold text-gray-900 mb-3">
            <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
            Niveaux
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onSelectNiveau(null)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                selectedNiveau === null ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              Tous les niveaux
            </button>
            {NIVEAUX.map(niveau => (
              <button
                key={niveau}
                onClick={() => onSelectNiveau(niveau)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center",
                  selectedNiveau === niveau ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {niveau}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center text-sm font-semibold text-gray-900 mb-3">
            <Book className="w-4 h-4 mr-2 text-blue-600" />
            Matières
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onSelectMatiere(null)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                selectedMatiere === null ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              Toutes les matières
            </button>
            {MATIERES.map(matiere => (
              <button
                key={matiere}
                onClick={() => onSelectMatiere(matiere)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center",
                  selectedMatiere === matiere ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <span className="truncate">{matiere}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
