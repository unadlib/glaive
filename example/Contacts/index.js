import Module from "../../src/Module"
import Decorator from "../../src/Decorator"

@Decorator({ deps: ["Network"] })
export default class Contacts extends Module {
  constructor(...args) {
    super(...args)
  }

  async initialize() {
    return setTimeout(() => {
      this.afterTest = "afterTest 5s"
    }, 5000)
  }
}
