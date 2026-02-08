import { useState, useCallback, useRef, useEffect } from 'react';

export const useHistory = (initialState) => {
  const [history, setHistory] = useState(() => [initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const historyRef = useRef(history);
  const currentIndexRef = useRef(currentIndex);

  // Keep refs in sync
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const setState = useCallback(
    (newStateOrUpdater) => {
      // Get current state from ref to avoid stale closure
      const currentState = historyRef.current[currentIndexRef.current];
      
      // Calculate new state (support both direct value and updater function)
      const newState = typeof newStateOrUpdater === 'function'
        ? newStateOrUpdater(currentState)
        : newStateOrUpdater;

      // Remove future states if we're not at the end
      const newHistory = historyRef.current.slice(0, currentIndexRef.current + 1);
      newHistory.push(newState);

      // Limit history size to prevent memory issues
      const limitedHistory =
        newHistory.length > 50 ? newHistory.slice(-50) : newHistory;

      // Update refs synchronously before state updates
      historyRef.current = limitedHistory;
      currentIndexRef.current = limitedHistory.length - 1;

      // Update state
      setHistory(limitedHistory);
      setCurrentIndex(limitedHistory.length - 1);
    },
    []
  );

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      return history[currentIndex - 1];
    }
    return history[currentIndex];
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return history[currentIndex + 1];
    }
    return history[currentIndex];
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    state: history[currentIndex],
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};

