import Module from "../../src/Module"

export default class Network extends Module {
  constructor(...opts) {
    super(...opts)
    this._moduleName = "Network"
    console.log("constructor Network")
  }
}
