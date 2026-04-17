import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useBeforeUnload, useBlocker } from 'react-router';
import { ConfirmModal } from '../components/ConfirmModal';

interface UnsavedChangesContextType {
  hasUnsavedChanges: boolean;
  setUnsavedChanges: (sourceId: string, hasChanges: boolean) => void;
  requestTabChange: (onProceed: () => void) => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined);

const UNSAVED_CHANGES_MESSAGE = 'Tienes cambios sin guardar. ¿Quieres cambiar de pestaña y perderlos?';

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const [dirtySources, setDirtySources] = useState<Record<string, boolean>>({});
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const setUnsavedChanges = useCallback((sourceId: string, hasChanges: boolean) => {
    setDirtySources((current) => {
      if (!hasChanges) {
        if (!(sourceId in current)) {
          return current;
        }

        const next = { ...current };
        delete next[sourceId];
        return next;
      }

      if (current[sourceId]) {
        return current;
      }

      return { ...current, [sourceId]: true };
    });
  }, []);

  const hasUnsavedChanges = useMemo(
    () => Object.values(dirtySources).some(Boolean),
    [dirtySources],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setPendingAction(null);
  }, []);

  const requestTabChange = useCallback((onProceed: () => void) => {
    if (!hasUnsavedChanges) {
      onProceed();
      return;
    }

    setPendingAction(() => onProceed);
    setIsConfirmOpen(true);
  }, [hasUnsavedChanges]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state !== 'blocked') {
      return;
    }

    setIsConfirmOpen(true);
  }, [blocker]);

  const handleConfirmNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      setIsConfirmOpen(false);
      blocker.proceed();
      return;
    }

    if (pendingAction) {
      const action = pendingAction;
      setIsConfirmOpen(false);
      setPendingAction(null);
      action();
      return;
    }

    setIsConfirmOpen(false);
  }, [blocker, pendingAction]);

  const handleCancelNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }

    closeConfirm();
  }, [blocker, closeConfirm]);

  useBeforeUnload(
    useCallback(
      (event) => {
        if (!hasUnsavedChanges) {
          return;
        }

        event.preventDefault();
        event.returnValue = '';
      },
      [hasUnsavedChanges],
    ),
  );

  const value = useMemo(
    () => ({ hasUnsavedChanges, setUnsavedChanges, requestTabChange }),
    [hasUnsavedChanges, requestTabChange, setUnsavedChanges],
  );

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
      <ConfirmModal
        open={isConfirmOpen}
        title="Cambios sin guardar"
        message={UNSAVED_CHANGES_MESSAGE}
        confirmText="Cambiar pestaña"
        cancelText="Seguir editando"
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
      />
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  const context = useContext(UnsavedChangesContext);

  if (!context) {
    throw new Error('useUnsavedChanges must be used within an UnsavedChangesProvider');
  }

  return context;
}