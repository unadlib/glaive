import Module from '../../src/Module'

export default class Network extends Module {
  constructor (...opts) {
    super(...opts)
    console.log('Network')
  }
}