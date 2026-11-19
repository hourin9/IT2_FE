import { useEffect, useRef } from 'react';

/**
 * Shared accessible modal behavior:
 * - Closes on Escape key
 * - Closes when clicking backdrop outside modal content (tracks mousedown so text selection drags never dismiss accidentally)
 * - Locks background page scroll while open
 */
export function useModalDismiss(isOpen: boolean, onClose: () => void) {
  const startedOnBackdropRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const backdropProps = {
    onMouseDown: (e: React.MouseEvent<HTMLElement>) => {
      startedOnBackdropRef.current = e.target === e.currentTarget;
    },
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      if (e.target === e.currentTarget && startedOnBackdropRef.current) {
        onClose();
      }
      startedOnBackdropRef.current = false;
    },
  };

  return { backdropProps };
}
