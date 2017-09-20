export default new Proxy(
  {},
  {
    get: (target, name) => value => {
      const type = value::Object.prototype.toString().slice(8, -1)
      return type[0].toLowerCase() + type.slice(1) === name
    },
  },
)
