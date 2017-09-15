import DI from '../src/DI'
import Call from './Call'
import Environment from './Environment'
import Network from './Network'
import Storage from './Storage'
import Contacts from './Contacts'

export default class Phone extends DI {
  constructor (...config) {
    super(...config)
  }

  initialize () {
    this
      .inject('Call', [
          'Contacts',
          'Network',
        ],
        (contacts, network) => {
          console.log(contacts)
          return new Call()
        })
      .inject('Contacts', [
          'Storage',
          'Network',
        ],
        async () => {
          await new Promise(function (resolve) {
            setTimeout(function () {
              resolve()
            }, 1000)
          })
          return await new Promise(initCallback => new Contacts({initCallback}))
        })
      .inject('Environment',
        [],
        () => {
          return new Environment()
        })
      .inject('Network', [
          'Environment',
        ],
        () => {
          return new Network()
        })
      .inject('Storage', [
          'Environment',
        ],
        () => {
          return new Storage()
        })
  }
}

const phone = new Phone({
  state: "CN"
})

console.log(phone)
