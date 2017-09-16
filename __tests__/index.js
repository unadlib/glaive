import { expect } from "chai"
import { DI, Module } from "../src/index"
import is from "../lib/isType"
import decorator from "../lib/decorator"

describe("Glaive", () => {
  describe("#Module Test", () => {
    it("initialize test", () => {
      expect(() => {
        new Module({ initCallBack: 1 })
      }).to.throw('"initCallBack" must be a function')
    })
    it("_initCallBack test", () => {
      expect(Module.prototype._initCallBack.call({ a: 1 }).a).to.equal(1)
    })
  })
  describe("#isType lib Test", () => {
    it("isType authentication type", () => {
      expect(is.Array([])).to.true
    })
    it("isType authentication type", () => {
      expect(is.Array({})).to.false
    })
  })
  describe("#Decorator Test", () => {
    it("decorator test", () => {
      expect(
        (() => {
          const that = {}
          decorator(["A"])(that)
          return that._dependencies
        })(),
      ).to.deep.equal(["A"])
    })
  })
  describe("#DI Module Test", () => {
    it("Dependency injection complete", () => {
      expect(
        (() => {
          const that = {}
          Reflect.apply(DI.prototype._complete, that, [])
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
          let list = []
          Reflect.apply(DI.prototype._queue, DI.prototype, [testModules, list])
          return list
        })(),
      ).to.deep.equal(expected)
    })
    it("Dependency injection unset `initialize`", () => {
      expect(() => new DI()).to.throw(
        "Please set initialization Dependency Injection configuration.",
      )
    })
    it("Dependency injection inject", () => {
      class A extends Module {}

      expect(
        (() => {
          const that = { _modules: [], _module: {} }
          Reflect.apply(DI.prototype.inject, that, [A, ["B"]])
          return [
            that._modules.length,
            that._modules[0].moduleName,
            that._modules[0].dependence,
          ]
        })(),
      ).to.deep.equal([1, "A", ["B"]])
    })

    it("Dependency injection bootstrap", () => {
      class A extends Module {
        constructor(...args) {
          super(...args)
          this.a = 1
        }
      }

      class B extends Module {
        constructor(...args) {
          super(...args)
          this.b = 1
        }

        async initialize({ initCallback } = {}) {
          return setTimeout(() => initCallback(this), 0)
        }
      }

      class TestModel extends DI {
        constructor(...config) {
          super(...config)
        }

        initialize() {
          this.inject(A).inject(B, ["A"], async () => {
            await new Promise(function(resolve) {
              setTimeout(function() {
                resolve()
              }, 0)
            })
          })
        }
      }

      const r = new TestModel()
      setTimeout(() => expect(r.A.a).to.equal(1), 100)
    })
  })
})
