import Injector from "../src/Injector"
import Call from "./Call"
import Environment from "./Environment"
import Network from "./Network"
import Storage from "./Storage"
import Contacts from "./Contacts"
import Done from "./Done"

export default class Phone extends Injector {
  constructor(...config) {
    super(...config)
    this.inject({
      module: Call,
      deps: ["Contacts", "Network"],
      infuse: {
        fn: () => {},
      },
      before: (contacts, network) => {
        return { c: 1 }
      },
      after: (contacts, network, call) => {
        console.log(contacts)
        call.a = contacts.afterTest
        console.log("\n")
        return { a: 1 }
      },
    })
      .inject({
        module: Contacts,
        deps: ["Storage"],
        after: async (storage, contacts) => {
          await new Promise(function(resolve) {
            setTimeout(function() {
              resolve()
            }, 1000)
          })
          console.log(storage, contacts, "afterContacts")
          console.log("\n")
        },
      })
      .inject({
        module: Environment,
        deps: [],
        after: () => {
          console.log("\n")
        },
      })
      .inject({
        module: Network,
        deps: ["Environment"],
        after: () => {
          console.log("\n")
        },
      })
      .inject({
        module: Storage,
        deps: ["Environment"],
        after: () => {
          console.log("\n")
        },
      })
      .inject({
        module: Done,
        deps: ["Call"],
        after: call => {
          console.log(call.a)
          console.log("\n")
        },
      })
  }

  distribute(result, dependence, injected) {
    dependence.map((item, index) => {
      result[`$${item.toLocaleLowerCase()}`] = injected[index]
    })
  }
}

class FooBarPhone extends Phone {
  constructor(...arg) {
    super(...arg)
    // this
    //   .inject({
    //     module: Call,
    //     deps: ["Contacts", "Network"],
    //     infuse: {
    //       fn: () => {
    //       },
    //     },
    //     before: (contacts, network) => {
    //       return {XoPhone: 1}
    //     }
    //   })
  }
}

const phone = new FooBarPhone(
  {
    state: "CN",
  },
  _phone => {
    console.log(_phone)
  },
)
