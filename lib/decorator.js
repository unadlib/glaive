const depend = (dependencies = [], callback) => (target) => {
  target._dependencies = dependencies
  target._callback = callback
}

const log = () => (target, key, descriptor) => {
  return descriptor
}

export {
  log,
  depend as default,
}