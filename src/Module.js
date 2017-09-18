import is from "../lib/isType"

export default class Module {
  constructor(...args) {
    this.initialize(...args)
  }

  initialize({ initCallBack = () => {} } = {}) {
    const callback = initCallBack || this._initCallBack
    if (is.Function(initCallBack)) {
      throw new Error('"initCallBack" must be a function')
    }
    return callback(this)
  }

  _initCallBack() {
    return this
  }
}
