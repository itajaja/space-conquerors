export function deepClone<T>(obj: T): T {
  // XXX: yolo
  return JSON.parse(JSON.stringify(obj))
}

// taken from josdejong/mathjs
export function lcm(a: number, b: number) {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error('Parameters in function lcm must be integer numbers')
  }

  if (a === 0 || b === 0) {
    return 0
  }

  // http://en.wikipedia.org/wiki/Euclidean_algorithm
  // evaluate lcm here inline to reduce overhead
  let t
  const prod = a * b
  while (b !== 0) {
    t = b
    b = a % t
    a = t
  }
  return Math.abs(prod / a)
}

/**
 * pick a random element from an array
 */
export function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * retrieve an item from an array with modulo index
 */
export function getItemCircular<T>(array: T[], index: number) {
  const n = array.length
  return array[((index % n) + n) % n]
}
