import { expect } from "chai"

describe("Test", () => {
  describe("#Test", () => {
    it("Test", () => {
      expect({ test: 1 }).to.not.equal({ test: 1 })
    })
  })
})
