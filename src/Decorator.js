export default (dependencies = {}) => target => {
  target._injectors = [...(target._injectors || []), dependencies]
  if (dependencies.key) {
    target._key = dependencies.key
  }
}

// export const prefix = '$$'
// export const allot = (target, key, descriptor) => {
//   const method = descriptor.value
//   const allotParams = function(config = {}) {
//     Object.entries(config)
//       .filter(([key]) => key !== 'allotParams' && key !== 'complete')
//       .map(([key, value]) => {
//         this[`${prefix}${key}`] = value
//       })
//   }
//   descriptor.value = (...args) => {
//     const [config] = args
//     return target::allotParams(config)
//   }
//   return descriptor
// }
