export function deepClone<T>(obj: T): T {
  // XXX: yolo
  return JSON.parse(JSON.stringify(obj))
}
