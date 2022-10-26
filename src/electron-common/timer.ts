export namespace TimeHelper {
  export function second(num: number) {
    return num * 1000
  }

  export function minute(num: number) {
    return num * second(60)
  }

  export function hour(num: number) {
    return num * minute(60)
  }
}
