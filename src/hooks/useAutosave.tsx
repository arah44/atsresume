import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAutosaveOptions<T> {
  data: T;
  onSave: (data: T) => void;
  delay?: number; // Debounce delay in milliseconds
  enabled?: boolean;
}

/**
 * Hook for autosaving data with debouncing
 *
 * @param data - The data to save
 * @param onSave - Function to call when saving
 * @param delay - Debounce delay in milliseconds (default: 2000ms)
 * @param enabled - Whether autosave is enabled (default: true)
 */
export function useAutosave<T>({
  data,
  onSave,
  delay = 2000,
  enabled = true,
}: UseAutosaveOptions<T>) {
  console.log('🎬 useAutosave hook called/re-rendered');

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  const previousDataRef = useRef<string>('');
  const isSavingRef = useRef(false);

  // Memoize save function but keep onSave stable
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const save = useCallback(() => {
    console.log('💡 save() function called');
    console.log('   - enabled:', enabled);
    console.log('   - isSaving:', isSavingRef.current);

    if (!enabled) {
      console.log('⚠️  Autosave disabled, skipping');
      return;
    }

    if (isSavingRef.current) {
      console.log('⚠️  Already saving, skipping');
      return;
    }

    try {
      isSavingRef.current = true;
      console.log('📤 Calling onSave callback...');
      onSaveRef.current(data);

      // Show subtle autosave notification
      console.log('📢 Showing toast notification...');
      toast.success('Autosaved', {
        duration: 1500,
        description: 'Your changes have been saved',
      });

      console.log('✅ Autosave completed successfully');
    } catch (error) {
      console.error('❌ Autosave failed:', error);
      toast.error('Autosave failed', {
        description: 'Please save manually to ensure your changes are preserved',
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [data, enabled]);

  useEffect(() => {
    // Skip on first render (initial load)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousDataRef.current = JSON.stringify(data);
      console.log('🔄 Autosave initialized (skipping first save)');
      return;
    }

    // Skip if autosave is disabled
    if (!enabled) {
      console.log('⏸️  Autosave disabled');
      return;
    }

    // Check if data actually changed
    const currentData = JSON.stringify(data);
    if (currentData === previousDataRef.current) {
      console.log('⏭️  No changes detected, skipping autosave');
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      console.log('🔄 Clearing previous autosave timer');
    }

    // Set new timeout for debounced save
    console.log(`⏱️  Changes detected! Will autosave in ${delay}ms...`);
    timeoutRef.current = setTimeout(() => {
      console.log('⏰ Debounce timer complete, triggering save now...');
      save();
      previousDataRef.current = currentData;
    }, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, save]);

  // Return manual trigger in case it's needed
  return { triggerSave: save };
}

