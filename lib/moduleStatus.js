export default new Proxy(
  {},
  {
    get: (target, name) => {
      return new Map(
        ["initial", "initialized", "booting", "ready"].map(i => [i, i]),
      ).get(name)
    },
  },
)
