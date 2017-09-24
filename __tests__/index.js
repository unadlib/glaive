import { expect } from "chai"
import { Injector as DeafultInjector, Module, Decorator } from "../src/index"
import is from "../lib/isType"
import sleep from "../lib/sleep"
import { ERROR } from "../lib/error"

const Injector = DeafultInjector()
describe("Glaive", () => {
  describe("#Module Test", () => {
    it("new Module Success test", () => {
      expect(
        (() => {
          class Test extends Module {}
          return new Test({ test: 1 })
        })()._test,
      ).to.equal(1)
    })
    it("new Module Error test", () => {
      expect(() => {
        class Test extends Module {}
        Test.prototype._allotParams = false
        new Test()
      }).to.throw(ERROR._allotParams)
    })
    it("_allotParams test", () => {
      expect(Module.prototype._allotParams.call({}, { a: 1 })._a).to.equal(1)
    })
  })
  describe("#isType lib Test", () => {
    it("isType authentication type", () => {
      expect(is.array([])).to.true
    })
    it("isType authentication type", () => {
      expect(is.array({})).to.false
    })
  })
  describe("#sleep lib Test", () => {
    it("sleep time is 0", async () => {
      sleep(0).then(arg => {
        expect(arg).to.true
      })
    })
    it("sleep time > 0", async () => {
      sleep(100).then(arg => {
        expect(arg).to.true
      })
    })
  })
  describe("#Decorator Test", () => {
    it("decorator test", () => {
      expect(
        (() => {
          const that = {}
          Decorator({ deps: ["A"] })(that)
          return that._injectors[0].deps
        })(),
      ).to.deep.equal(["A"])
    })
  })
  describe("#Injector Test", () => {
    it("Dependency injection complete", () => {
      expect(
        (() => {
          const that = {}
          Reflect.apply(Injector.prototype._complete, that, [{ done: r => r }])
          return that.initiated
        })(),
      ).to.be.true
    })
    it("Dependency injection queue", () => {
      const testModules = [
        {
          moduleName: "a",
          dependence: ["c", "d"],
        },
        {
          moduleName: "b",
          dependence: ["d"],
        },
        {
          moduleName: "c",
          dependence: [],
        },
        {
          moduleName: "d",
          dependence: ["e"],
        },
        {
          moduleName: "e",
          dependence: ["c"],
        },
      ]
      const expected = ["c", "e", "d", "a", "b"]
      expect(
        (() => {
          let list = new Set()
          Reflect.apply(Injector.prototype._queue, Injector.prototype, [
            testModules,
            list,
          ])
          return [...list]
        })(),
      ).to.deep.equal(expected)
    })
    it("Dependency injection bootstrap", () => {
      class Call extends Module {}

      @Decorator({
        deps: ["Environment"],
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
        done: () => {
          expect(mobile.env.system).to.equal("ios")
        },
      })
    })
  })
})
