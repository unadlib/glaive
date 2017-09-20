import is from "../lib/isType"
import allot from "../lib/allot"
import error from "../lib/error"
import moduleStatus from "../lib/moduleStatus"

export default class Module {
  constructor(args) {
    const isFunction = is.function(this._allotParams)
    if (isFunction) {
      this._allotParams(args)
    } else {
      error.allotParams()
    }
    this.__status = moduleStatus.initial
  }

  _allotParams(config) {
    return this::allot(config)
  }
}
