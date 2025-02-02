import {beforeEach, describe, expect, it, jest} from '@jest/globals'
import {Bud} from '@repo/test-kit/bud'

import {config as configFn} from './config.method.js'

const mockBud = {
  bindMethod: jest.fn(() => null),
  hooks: {
    action: jest.fn(() => null),
  },
  log: jest.fn(() => null),
  error: jest.fn(() => null),
  fatal: jest.fn(() => null),
} as unknown as Bud

describe(`bud.config`, function () {
  let config: configFn

  beforeEach(async () => {
    config = configFn.bind(mockBud)
    jest.clearAllMocks()
  })

  it(`should be a function`, () => {
    expect(config).toBeInstanceOf(Function)
  })

  it(`should return bud`, () => {
    expect(config({})).toEqual(mockBud)
  })

  it(`should throw with no input`, () => {
    // @ts-ignore
    expect(() => config()).toThrow()
  })

  it(`should accept object configuration`, async () => {
    config({entry: `foo`})
    expect(mockBud.hooks.action).toHaveBeenCalledWith(
      `build.after`,
      expect.any(Function),
    )
  })

  it(`should accept a callback function`, async () => {
    const callback = () => ({})
    config(callback)
    expect(mockBud.hooks.action).toHaveBeenCalledWith(
      `build.after`,
      expect.any(Function),
    )
  })
})
