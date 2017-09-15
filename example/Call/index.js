import Module from '../../src/Module'

export default class Call extends Module {
  constructor (...opts) {
    super(...opts)
    this._moduleName = 'Call'
    console.log('Call')
  }
}