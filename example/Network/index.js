import Module from '../../lib/Module'

export default class Network extends Module {
  constructor (...opts) {
    super(...opts)
    console.log('Network')
  }
}