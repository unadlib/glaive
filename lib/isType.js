export default new Proxy(
  {},
  {
    get: (target, name) => value =>
      value::Object.prototype.toString().slice(8, -1) === name,
  },
)
