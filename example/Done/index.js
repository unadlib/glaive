import Module from "../../src/Module"

export default class Done extends Module {
  constructor(...opts) {
    super(...opts)
    this._moduleName = "Done"
    console.log("constructor Done")
  }
}
