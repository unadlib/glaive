export const ERROR = {
  allotParams: `\'allotParams\' must be a function`,
  boot: `\`Injector failed to boot up \``,
  module: `\'module\' must be a function or class`,
}

const error = new Proxy(
  {},
  {
    get: (target, name) => value => {
      return ERROR[name] || `${value} Error`
    },
  },
)

export default new Proxy(
  {},
  {
    get: (target, name) => value => {
      throw new Error(error[name](value))
    },
  },
)
