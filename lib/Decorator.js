export default (dependencies = {}) => target => {
  target._injectors = [...target._injectors, dependencies]
}
