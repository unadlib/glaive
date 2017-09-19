export const prefix = "_"
export default function(config = {}) {
  Object.entries(config)
    .filter(([key]) => key !== "allotParams" && key !== "complete")
    .map(([key, value]) => {
      this[`${prefix}${key}`] = value
    })
  return this
}
