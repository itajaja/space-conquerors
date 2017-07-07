declare const process: {
  env: {
    UPSTREAM_ORIGIN: string,
  },
}

export const {
  UPSTREAM_ORIGIN,
} = process.env
