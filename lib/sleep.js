export default async time => {
  return await new Promise(resolve => {
    if (!time) {
      resolve()
    } else {
      setTimeout(resolve, time)
    }
  })
}
