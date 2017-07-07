declare const process: {
  env: {
    UPSTREAM_ORIGIN: string,
  },
}

console.log(process)
export const {
  UPSTREAM_ORIGIN,
} = process.env
