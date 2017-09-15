import Module from '../../lib/Module'

export default class Contacts extends Module {
  constructor (...args) {
    super(...args)
    console.log('Contacts')
    this.initTest = 'Test Contacts'
  }

  initialize ({initCallback} = {}) {
    return setTimeout(() => {
      this.afterTest = 'afterTest 5s'
      initCallback(this)
    }, 5000)
  }
}