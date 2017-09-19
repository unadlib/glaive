import is from "../lib/isType"
import allot from "../lib/allot"

export default class Module {
  constructor(args) {
    const isFunction = is.Function(this._allotParams)
    if (isFunction) {
      this._allotParams(args)
    } else {
      throw new Error('"_allotParams" must be a function')
    }
  }

  _allotParams(config) {
    return this::allot(config)
  }
}
