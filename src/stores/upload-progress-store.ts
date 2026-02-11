import { create } from "zustand";

interface UploadProgressState {
  isUploading: boolean;
  completed: number;
  total: number;
}

interface UploadProgressActions {
  startUpload: (total: number) => void;
  setProgress: (completed: number, total: number) => void;
  finishUpload: () => void;
}

type UploadProgressStore = UploadProgressState & UploadProgressActions;

const initialState: UploadProgressState = {
  isUploading: false,
  completed: 0,
  total: 0,
};

export const useUploadProgressStore = create<UploadProgressStore>()((set) => ({
  ...initialState,

  startUpload: (total) => set({ isUploading: true, completed: 0, total }),

  setProgress: (completed, total) => set({ completed, total }),

  finishUpload: () => set(initialState),
}));
