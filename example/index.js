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
        }
      )
      .inject(Contacts, [
          'Storage',
        ],
        async (storage, contacts) => {
          console.log(storage, contacts,"afterContacts")
          // await new Promise(function (resolve) {
          //   setTimeout(function () {
          //     resolve()
          //   }, 1000)
          // })
        }
      )
      .inject(Environment,
        [],
        () => {

        }
      )
      .inject(Network, [
          'Environment',
        ],
        () => {

        }
      )
      .inject(Storage, [
          'Environment',
        ],
        () => {

        }
      )
      .inject(Done, [
          'Call',
        ],
        (call) => {
          console.log(call.a,)
        }
      )
  }
}

const phone = new Phone({
  state: 'CN'
})

// console.log(phone)
