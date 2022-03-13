export function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

export function debounce(fn: Function, delay: number, that?: any) {
  let timer: NodeJS.Timeout | null = null;

  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    timer = setTimeout(fn.bind(that, ...args), delay);
  };
}
