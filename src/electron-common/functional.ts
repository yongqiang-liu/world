import type EventEmitter from 'events'
import { TimeHelper } from './timer'

export function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms)
  })
}

export function debounce(fn: Function, delay: number, that?: any) {
  let timer: NodeJS.Timeout | null = null

  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    timer = setTimeout(fn.bind(that, ...args), delay)
  }
}

export function timeoutWithPromise<T>(
  fn: (...args: any[]) => Promise<T>,
  fallback: T,
  timeout = 1000,
): Promise<T> {
  return new Promise(async (resolve) => {
    setTimeout(() => resolve(fallback), timeout)

    resolve(await fn())
  })
}

export function fromEmitter<T>(
  target: EventEmitter,
  channel: string,
  callback?: (...args: any[]) => T,
): Promise<T | void> {
  return new Promise((resolve) => {
    target.once(channel, (...args: any[]) => {
      if (callback)
        resolve(callback?.(...args))
      else resolve()
    })
  })
}

export function deepProxy<T extends object>(
  target: T,
  handler: ProxyHandler<T>,
): T {
  const keys = Object.keys(target)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    // @ts-expect-error
    if (typeof target[key] === 'object') {
      // @ts-expect-error
      target[key] = deepProxy(target[key], handler)
    }
  }

  return new Proxy(target, handler)
}

export function when<T>(
  target: T,
  condition?: (arg1: T) => boolean,
): Promise<void> {
  return new Promise((resolve) => {
    const t = setInterval(() => {
      if (condition && condition(target)) {
        resolve()
        clearInterval(t)
      }
      else if (target) {
        setTimeout(() => resolve(), 1000)
        clearInterval(t)
      }
    }, TimeHelper.second(1))
  })
}
