// import { log } from '../lib/decorator'

export default class Module {
  constructor(...args) {
    this.initialize(...args)
  }

  initialize({ initCallBack = () => {} } = {}) {
    const callback = initCallBack || this._initCallBack
    if (typeof initCallBack !== "function") {
      throw new Error('"initCallBack" must be a function')
    }
    return callback(this)
  }

  _initCallBack() {
    return this
  }
}
