import localforage from 'localforage';

const fileStore = localforage.createInstance({
  name: 'EduDocManager',
  storeName: 'pdf_files',
  description: 'Stores PDF blob data locally'
});

export const savePdfFile = async (key: string, file: File): Promise<void> => {
  await fileStore.setItem(key, file);
};

export const getPdfFile = async (key: string): Promise<File | null> => {
  return await fileStore.getItem<File>(key);
};

export const deletePdfFile = async (key: string): Promise<void> => {
  await fileStore.removeItem(key);
};
