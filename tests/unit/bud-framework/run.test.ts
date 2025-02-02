import {describe, expect, it, jest} from '@jest/globals'
import {Bud, factory} from '@repo/test-kit/bud'
import {run} from '@roots/bud-framework/methods/run'
import {Service} from '@roots/bud-framework/service'
import {noop} from 'lodash-es'

class MockCompiler extends Service {
  public compile = jest.fn(() => ({run: this.invoke}))
  public invoke = jest.fn(noop)
  public callback = jest.fn(noop)
}

class MockServer extends Service {
  public run = jest.fn(noop)
}

describe(`bud.run`, function () {
  let bud: Bud

  it(`is a function`, async () => {
    bud = await factory()
    expect(JSON.stringify(run)).toEqual(JSON.stringify(bud.run))
  })
})
