import { onUnmounted } from 'vue';

export function usePolling(fn: () => void, interval = 60000) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let requestFrameId: number | null = null;
  let isPolling = false;

  const stop = () => {
    isPolling = false;
    if (timeoutId) clearTimeout(timeoutId);
    if (requestFrameId) cancelAnimationFrame(requestFrameId);
  };

  const schedule = () => {
    if (!isPolling) return;
    timeoutId = setTimeout(() => {
      requestFrameId = requestAnimationFrame(() => {
        if (!isPolling) return;
        fn();
        schedule();
      });
    }, interval);
  };

  const start = () => {
    if (isPolling) return;
    isPolling = true;
    schedule();
  };

  onUnmounted(() => {
    stop();
  });

  return {
    start,
    stop
  };
}
