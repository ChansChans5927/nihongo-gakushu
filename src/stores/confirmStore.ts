import { create } from 'zustand';

interface ConfirmState {
  isOpen: boolean;
  isAlert: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  showConfirm: (message: string) => Promise<boolean>;
  showAlert: (message: string) => Promise<void>;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  isAlert: false,
  message: '',
  onConfirm: () => {},
  onCancel: () => {},
  showConfirm: (message: string) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        isAlert: false,
        message,
        onConfirm: () => {
          set({ isOpen: false });
          resolve(true);
        },
        onCancel: () => {
          set({ isOpen: false });
          resolve(false);
        }
      });
    });
  },
  showAlert: (message: string) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        isAlert: true,
        message,
        onConfirm: () => {
          set({ isOpen: false });
          resolve();
        },
        onCancel: () => {
          set({ isOpen: false });
          resolve();
        }
      });
    });
  }
}));
