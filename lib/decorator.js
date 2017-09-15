const depend = (...modules) => (target) => {
  target._dependencies = modules
}

const log = () => (target, key, descriptor) => {
  return descriptor
}

export {
  log,
  depend as default,
}