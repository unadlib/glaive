# Glaive
Trying to build a new dependency module Injector
---
[![Travis](https://img.shields.io/travis/unadlib/glaive.svg)](https://travis-ci.org/unadlib/glaive)
[![Coverage Status](https://coveralls.io/repos/github/unadlib/glaive/badge.svg?branch=master)](https://coveralls.io/github/unadlib/glaive?branch=master)
[![npm](https://img.shields.io/npm/v/glaive.svg)](https://www.npmjs.com/package/glaive)
[![npm](https://img.shields.io/npm/dt/glaive.svg)](https://www.npmjs.com/package/glaive)
[![npm](https://img.shields.io/npm/l/glaive.svg)](https://www.npmjs.com/package/glaive)

## Features
* Support Overall Process Async Dependency Module
* After/Before Inject Process
* Support Functional Inject & Decorator Inject
* Custom Injector

## Usage
```bash
npm install --save glaive
//or use `yarn` command
yarn add glaive
```

## Example
```javascript
import { DI, Module, depend } from 'glaive'

class Call extends Module {}

@depend('Environment',aysnc (environment)=>{
  //this time is before NetWork init.
})
class NetWork extends Module {}

class Environment extends Module {}

class Storage extends Module {
  constructor(...args) {
    super(...args)
  }
  async initialize({initCallback} = {}) {
    return setTimeout(() => initCallback(this), 0)
  }
}

// All aysnc functions support sync.

class Phone extends DI {
  constructor(...config) {
    super(...config)
  }

  initialize() {
    this
      .inject(Environment)
      .inject(Storage, ['Environment'], async (environment,storage) => {
        await new Promise((resolve)=>setTimeout(resolve, 0))
      })
      .inject(NetWork)
      .inject(Call, ['Environment','Storage','NetWork'],async (environment,storage,netWork,call) => {
        // this time is after call init.
      })
  }
}

const config = {
  state: 'CN'
}

new Phone(config,(phone)=>{
  console.log(phone.initiated === true) // `new Phone` all actions is initiated.
})

```
