const depend = (dependencies = [], callback) => target => {
  target._dependencies = dependencies
  target._callback = callback
}

export { depend as default }
