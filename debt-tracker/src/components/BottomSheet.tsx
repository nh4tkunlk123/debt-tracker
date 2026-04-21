import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div className="bottom-sheet">
        <div className="bottom-sheet-handle" />
        <div className="flex justify-between items-center mb-4" style={{ flexShrink: 0 }}>
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '50%' }}>
            <X size={20} color="var(--text-secondary)" />
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, paddingBottom: '24px' }}>
          {children}
        </div>
      </div>
    </>
  );
};
