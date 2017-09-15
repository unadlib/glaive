import Module from '../../src/Module'

export default class Environment extends Module {
  constructor (...opts) {
    super(...opts)
    this._moduleName = 'Environment'
    console.log('Environment')
  }
}