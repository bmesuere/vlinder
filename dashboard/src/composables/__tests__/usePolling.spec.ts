import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePolling } from '../usePolling';
import { onUnmounted } from 'vue';

vi.mock('vue', () => ({
  onUnmounted: vi.fn(),
}));

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 10) as unknown as number);
    vi.spyOn(window, 'cancelAnimationFrame');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should schedule the function call', () => {
    const fn = vi.fn();
    const { start } = usePolling(fn, 1000);

    start();

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000); // Trigger setTimeout
    vi.advanceTimersByTime(10);   // Trigger RAF (mocked as setTimeout 10ms)

    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    vi.advanceTimersByTime(10);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should stop polling when stop is called', () => {
    const fn = vi.fn();
    const { start, stop } = usePolling(fn, 1000);

    start();
    vi.advanceTimersByTime(1000);
    vi.advanceTimersByTime(10);
    expect(fn).toHaveBeenCalledTimes(1);

    stop();

    vi.advanceTimersByTime(1000);
    vi.advanceTimersByTime(10);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should register onUnmounted hook', () => {
    const fn = vi.fn();
    usePolling(fn, 1000);

    expect(onUnmounted).toHaveBeenCalled();
  });

  it('should not start multiple polling loops if start is called multiple times', () => {
    const fn = vi.fn();
    const { start } = usePolling(fn, 1000);

    start();
    start();
    start();

    vi.advanceTimersByTime(1000);
    vi.advanceTimersByTime(10);
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    vi.advanceTimersByTime(10);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
