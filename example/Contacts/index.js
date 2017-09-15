import Module from '../../src/Module'
import depend from '../../lib/decorator'

@depend(['Network', 'Storage'], (network, storage) => {
  console.log(network, storage, 'beforeContacts')
})
export default class Contacts extends Module {
  constructor (...args) {
    super(...args)
    this._moduleName = 'Contacts'
    this.initTest = 'Test Contacts'
    console.log('Contacts')
  }

  async initialize ({initCallback} = {}) {
    return setTimeout(() => {
      this.afterTest = 'afterTest 5s'
      initCallback(this)
    }, 5000)
  }
}
