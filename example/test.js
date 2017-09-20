import { Injector, Module, Decorator } from "../src"

class Call extends Module {}

@Decorator({
  deps: ["Environment"],
  after: environment => {
    console.log(environment)
  },
})
class NetWork extends Module {}

class HighSpeedNetWork extends NetWork {}
class Environment extends Module {
  constructor(...args) {
    super(...args)
    this.system = "ios"
  }
}

class Storage extends Module {
  constructor(...args) {
    super(...args)
  }
  async initialize() {
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}

// All aysnc functions support sync.

class Phone extends Injector {
  constructor(...args) {
    super(...args)
    this.inject([
      {
        module: Environment,
        key: "env",
      },
      {
        module: Storage,
        deps: ["Environment"],
        before: async (environment, storage) => {
          console.log(environment, storage)
          await new Promise(resolve => setTimeout(resolve, 0))
        },
      },
      {
        module: NetWork,
      },
      {
        module: Call,
        deps: ["Environment", "Storage", "NetWork"],
        after: async () => {
          await new Promise(resolve => setTimeout(resolve, 0)) // this time is after call init.
        },
      },
    ])
  }
}

class Mobile extends Phone {
  constructor(...args) {
    super(...args)
    this.inject([
      {
        module: HighSpeedNetWork,
        key: "$_HighSpeedNetWork",
        deps: ["Storage"],
      },
    ])
  }
}

const mobile = new Mobile({
  state: "CN",
  done: done => {
    console.log("\n")
    console.log(`done is ${done}!\n`, mobile)
  },
})
