import Module from "../../src/Module"
import Decorator from "../../lib/Decorator"

@Decorator({
  deps: ["Network", "Storage"],
  before: async (network, storage) => {
    await new Promise(function(resolve) {
      setTimeout(function() {
        resolve()
      }, 1000)
    })
    console.log(network, storage, "beforeContacts")
  },
})
export default class Contacts extends Module {
  constructor(...args) {
    super(...args)
    console.log("Contacts")
  }

  async initialize({ initCallback } = {}) {
    return setTimeout(() => {
      this.afterTest = "afterTest 5s"
      initCallback(this)
    }, 5000)
  }
}
