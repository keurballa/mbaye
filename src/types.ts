export interface DocumentMeta {
  id: string;
  userId: string;
  originalName: string;
  systemName: string;
  matiere: string;
  niveau: string;
  categorie: string;
  fileKey: string;
  createdAt: number;
  updatedAt: number;
}

export const MATIERES = [
  'Mathématiques',
  'Français',
  'Histoire-Géographie',
  'Physique-Chimie',
  'SVT',
  'Anglais',
  'Espagnol',
  'Philosophie',
  'Autre'
];

export const NIVEAUX = [
  '6e',
  '5e',
  '4e',
  '3e',
  '2nde',
  '1ère',
  'Terminale',
  'Supérieur'
];

export const CATEGORIES = [
  'Cours',
  "Exercices d'entraînement",
  'Devoirs de contrôle',
  'Compositions',
  'Fiches de révision',
  'Autre'
];
