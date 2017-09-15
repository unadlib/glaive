export default new Proxy({}, {
  get: (target, name) => (value) => (
    value::Object.prototype.toString() === `[object ${name}]`
  )
})