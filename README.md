# Glaive
Trying to build a new dependency module Injector

[![Travis](https://img.shields.io/travis/unadlib/glaive.svg)](https://travis-ci.org/unadlib/glaive)
[![Coverage Status](https://coveralls.io/repos/github/unadlib/glaive/badge.svg?branch=master)](https://coveralls.io/github/unadlib/glaive?branch=master)
[![npm](https://img.shields.io/npm/v/glaive.svg)](https://www.npmjs.com/package/glaive)
[![npm](https://img.shields.io/npm/dt/glaive.svg)](https://www.npmjs.com/package/glaive)
[![npm](https://img.shields.io/npm/l/glaive.svg)](https://www.npmjs.com/package/glaive)

## Features
* Overall process async dependency module
* After/before inject process
* Functional inject & decorator inject
* Custom Injector
* Implement module initialization lifecycle
* Inheritance of module
* Inheritance of module injector
* Override of module injector
* Merge options for value provider
* Custom options distribute to module
* Custom rule distribute to dependency module
* Custom distribute module name to dependency module
* Before injection use `preInject`
* Commons mount Params use `mountParams`
* dependency Module `preDistribute`

## Usage
```bash
yarn add glaive // or `npm install --save glaive`
```

## Example
```javascript
import { Injector as getInjector, Module, Decorator } from "glaive"

const Injector = getInjector(class BaseModule {})

class Call extends Module {}

@Decorator({
  deps: ["Environment"],
  after: environment => {
    console.log(environment)
  },
})
class NetWork extends Module {}

class HighSpeedNetWork extends NetWork {}

class Environment extends Module {
  constructor(...args){
    super(...args)
    this.system = 'ios'
  }
}

class Storage extends Module {
  constructor(...args) {
    super(...args)
  }
  async initialize() {
    await new Promise(resolve=>setTimeout(resolve, 0))
  }
}

// All aysnc functions support sync.

class Phone extends Injector {
  constructor(...args) {
    super(...args)
    this.inject([
        {
          module: Environment,
          key: "env"
        },
        {
          module: Storage,
          deps: ['Environment'],
          before: async (environment,storage) => {
            console.log(environment,storage)
            await new Promise(resolve=>setTimeout(resolve, 0))
          }
        },
        {
          module: NetWork,
        },
        {
          module: Call,
          deps: ['Environment','Storage','NetWork'],
          after: async () => {
            await new Promise(resolve=>setTimeout(resolve, 0)) // this time is after call init.
          }
        }
      ])
  }
}

class Mobile extends Phone {
    constructor(...args){
      super(...args)
      this.inject([
        {
          module: HighSpeedNetWork,
          key: '$_HighSpeedNetWork',
          deps: ['Storage']
        }
      ])
    }
}

const mobile = new Mobile({
  state: 'CN',
  done: done => {
    console.log('\n')
    console.log(`done is ${done}!\n`, mobile)
  },
})

```
