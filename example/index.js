import Injector from "../src/Injector"
import Call from "./Call"
import Environment from "./Environment"
import Network from "./Network"
import Storage from "./Storage"
import Contacts from "./Contacts"
import ContactsSearch from "./ContactsSearch"
import Done from "./Done"

export default class Phone extends Injector {
  constructor(...config) {
    super(...config)
    this.inject([
      {
        module: Contacts,
        key: "cccccontacts",
        deps: ["Storage"],
      },
      {
        module: Environment,
      },
      {
        module: Network,
        deps: ["Environment"],
      },
      {
        module: Storage,
        deps: ["Environment"],
      },
    ])
  }
}

class FooBarPhone extends Phone {
  constructor(...arg) {
    super(...arg)
    this.inject([
      {
        module: Contacts,
        key: "aaaaontacts",
      },
      {
        module: Call,
        key: "calls",
        deps: ["Contacts", "Network"],
      },
      {
        module: Done,
        deps: ["Call"],
      },
      {
        module: ContactsSearch,
        deps: ["Call"],
      },
    ])
  }
}

const phone = new FooBarPhone({
  state: "CN",
  done: done => {
    console.log("\n")
    console.log(done, phone)
  },
})

// class A extends Module {
//   // constructor(...args) {
//   //   super(...args)
//   //   // this._a = 1
//   // }
//   // initialize() {
//   //   console.log('A')
//   // }
// }
//
// @decorator({deps: ['A']})
// class B extends A {
//   // initialize() {
//   //   this._b = 1
//   //   console.log('B')
//   // }
// }
//
// @decorator({deps: ['B']})
// class E extends B {
//   // initialize() {
//   //   this._e = 1
//   //   console.log('E')
//   // }
// }
//
// class C extends Module {
//   // async initialize() {
//   //   await sleep(1000)
//   //   this._ds = 1
//   //   console.log('C')
//   // }
// }
//
// class D extends C {
//   // initialize() {
//   //   this._ds = 1
//   //   console.log('D')
//   // }
// }
//
// class Phone extends Injector {
//   constructor(...args) {
//     super(...args)
//     this.inject([
//       {
//         module: C,
//         deps: ['A', 'B'],
//         params: {
//           testB: 2,
//         },
//         // after: async (...args) => {
//         //   await sleep(1000)
//         //   console.log('after')
//         //
//         //   return {}
//         // },
//         // before: async (...args) => {
//         //   await sleep(1000)
//         //   console.log('before')
//         //   return {}
//         // },
//       },
//       {
//         module: A,
//         params: {
//           testA: 2,
//         },
//       },
//       {
//         module: B,
//         params: {
//           testB: 2,
//         },
//       },
//     ])
//     // console.log(Object.keys(this._modules),1)
//   }
// }
//
// class Bee extends Phone {
//   constructor(...args) {
//     super(...args)
//     this.inject([
//       {
//         module: E,
//         params: {
//           testE: 1,
//         },
//       },
//       {
//         module: D,
//         deps: ['E'],
//         params: {
//           testB: 1,
//         },
//       },
//     ])
//   }
// }
//
// const a = new Bee({
//   text: 1,
//   done: (s) => {
//     console.log(`\n`);
//     console.log(a)
//   }
// })
