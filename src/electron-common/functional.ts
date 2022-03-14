import EventEmitter from "events";

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

export function timeoutWithPromise<T>(
  fn: (...args: any[]) => Promise<T>,
  fallback: T,
  timeout: number = 1000
): Promise<T> {
  return new Promise(async (resolve) => {
    setTimeout(() => resolve(fallback), timeout);

    resolve(await fn());
  });
}

export function fromEmitter<T>(
  target: EventEmitter,
  channel: string,
  callback: (...args: any[]) => T
): Promise<T> {
  return new Promise((resolve) => {
    target.once(channel, (...args: any[]) => {
      resolve(callback(...args));
    });
  });
}
