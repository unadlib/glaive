export default async time =>
  await new Promise(resolve => {
    if (!time) {
      resolve(true)
    } else {
      setTimeout(() => resolve(true), time)
    }
  })
