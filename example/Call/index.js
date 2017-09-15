import Module from '../../src/Module'

export default class Call extends Module {
  constructor (...opts) {
    super(...opts)
    console.log('Call')
  }
}