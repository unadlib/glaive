export default async time => {
  return await new Promise(resolve => {
    if (!time) {
      resolve(true)
    } else {
      setTimeout(() => resolve(true), time)
    }
  })
}
