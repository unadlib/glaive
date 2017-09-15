export default class Module {
  constructor (...args) {
    this.initialize(...args)
  }

  initialize ({initCallBack} = {}) {
    const callback = initCallBack || this._initCallBack
    return callback(this)
  }

  _initCallBack () {
    return this
  }
}