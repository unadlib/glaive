import DI from '../src/DI'
import Call from './Call'
import Environment from './Environment'
import Network from './Network'
import Storage from './Storage'
import Contacts from './Contacts'
import Done from './Done'

export default class Phone extends DI {
  constructor (...config) {
    super(...config)
  }

  initialize () {
    this
      .inject(Call, [
          'Contacts',
          'Network',
        ],
        (contacts, network, call) => {
          console.log(contacts)
          call.a = contacts.afterTest
          console.log('\n')
        }
      )
      .inject(Contacts, [
          'Storage',
        ],
        async (storage, contacts) => {
          await new Promise(function (resolve) {
            setTimeout(function () {
              resolve()
            }, 1000)
          })
          console.log(storage, contacts,"afterContacts")
          console.log('\n')
        }
      )
      .inject(Environment,
        [],
        () => {
          console.log('\n')
        }
      )
      .inject(Network, [
          'Environment',
        ],
        () => {
          console.log('\n')
        }
      )
      .inject(Storage, [
          'Environment',
        ],
        () => {
          console.log('\n')
        }
      )
      .inject(Done, [
          'Call',
        ],
        (call) => {
          console.log(call.a)
          console.log('\n')
        }
      )
  }

  injector (result, dependence, injected) {
    dependence.map((item, index) => {
      result[`$${item.toLocaleLowerCase()}`] = injected[index]
    })
  }

}

const phone = new Phone({
  state: 'CN'
})

// console.log(phone)
