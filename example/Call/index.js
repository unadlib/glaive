import Module from '../../lib/Module'

export default class Call extends Module {
  constructor (...opts) {
    super(...opts)
    console.log('Call')
  }
}