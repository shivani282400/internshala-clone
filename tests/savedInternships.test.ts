import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSavedInternships } from '@/hooks/useSavedInternships';
import { useToastStore } from '@/store/toastStore';

describe('useSavedInternships', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock);
    localStorage.clear();
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should initialize with empty array if nothing in localStorage', () => {
    const { result } = renderHook(() => useSavedInternships());
    expect(result.current.savedIds).toEqual([]);
    expect(result.current.savedCount).toBe(0);
  });

  it('should load saved IDs from localStorage', () => {
    localStorage.setItem('savedInternships', JSON.stringify([123, 456]));
    const { result } = renderHook(() => useSavedInternships());
    expect(result.current.savedIds).toEqual([123, 456]);
    expect(result.current.savedCount).toBe(2);
    expect(result.current.isSaved(123)).toBe(true);
    expect(result.current.isSaved(789)).toBe(false);
  });

  it('should handle corrupt localStorage data safely', () => {
    localStorage.setItem('savedInternships', 'corrupted-json');
    const { result } = renderHook(() => useSavedInternships());
    expect(result.current.savedIds).toEqual([]);
    expect(result.current.savedCount).toBe(0);
  });

  it('should toggle save state and persist in localStorage', () => {
    const { result } = renderHook(() => useSavedInternships());

    // Save an internship
    act(() => {
      result.current.toggleSaved(100);
    });
    expect(result.current.savedIds).toEqual([100]);
    expect(result.current.savedCount).toBe(1);
    expect(localStorage.getItem('savedInternships')).toBe(JSON.stringify([100]));

    // Remove the internship
    act(() => {
      result.current.toggleSaved(100);
    });
    expect(result.current.savedIds).toEqual([]);
    expect(result.current.savedCount).toBe(0);
    expect(localStorage.getItem('savedInternships')).toBe(JSON.stringify([]));
  });

  it('should trigger toast notifications when saving or removing', () => {
    const { result } = renderHook(() => useSavedInternships());

    // Toggle save on
    act(() => {
      result.current.toggleSaved(200);
    });
    const toastsAfterSave = useToastStore.getState().toasts;
    expect(toastsAfterSave).toHaveLength(1);
    expect(toastsAfterSave[0].message).toBe('Internship saved');
    expect(toastsAfterSave[0].type).toBe('success');

    // Toggle save off
    act(() => {
      result.current.toggleSaved(200);
    });
    const toastsAfterRemove = useToastStore.getState().toasts;
    // The previous toast is still in state (it would expire after 3s, but in test it is instant)
    expect(toastsAfterRemove).toHaveLength(2);
    expect(toastsAfterRemove[1].message).toBe('Removed from saved internships');
    expect(toastsAfterRemove[1].type).toBe('info');
  });
});
