import Module from '../../src/Module'

export default class Storage extends Module {
  constructor (...opts) {
    super(...opts)
    this._moduleName = 'Storage'
    console.log('Storage')
  }
}