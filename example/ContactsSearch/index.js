import Contacts from "../Contacts"
import Decorator from "../../src/Decorator"

@Decorator({
  deps: ["Environment"],
  after: Environment => {
    console.log(Environment)
  },
})
export default class ContactsSearch extends Contacts {}
