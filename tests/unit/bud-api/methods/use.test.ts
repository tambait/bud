/* eslint-disable n/no-extraneous-import */
import {Bud, factory} from '@repo/test-kit/bud'
import Babel from '@roots/bud-babel'
import HtmlWebpackPlugin from 'html-webpack-plugin'

describe(`bud.use`, function () {
  let bud: Bud
  let HTMLWebpackInstance = new HtmlWebpackPlugin()

  beforeAll(async () => {
    bud = await factory()

    bud.extensions.repository = {} as any // reset extensions

    bud.use({
      label: `css-minimizer-webpack-plugin`,
      options: {},
    })

    await bud.api.processQueue()
  })

  it(`is a function`, () => {
    expect(bud.use).toBeInstanceOf(Function)
  })

  it(`returns bud`, () => {
    expect(bud.use({label: `foo`})).toBeInstanceOf(Bud)
  })

  it(`registers an imported extension`, async () => {
    await bud.extensions.add(Babel)
    await bud.api.processQueue()
    expect(bud.extensions.has(`@roots/bud-babel`))
  })

  it(`registers an inline extension`, async () => {
    bud.use({label: `inline-extension`})
    await bud.api.processQueue()
    expect(bud.extensions.has(`inline-extension`))
  })

  it(`registers an anonymous extension`, async () => {
    bud.use({options: {}})
    await bud.api.processQueue()
    expect(Object.keys(bud.extensions.repository).length).toEqual(5)
  })

  it(`registers a webpack plugin`, async () => {
    bud.use(HTMLWebpackInstance)
    await bud.api.processQueue()
    expect(bud.extensions.has(`HtmlWebpackPlugin`)).toBe(true)
  })

  it(`registers an inline webpack plugin`, async () => {
    bud.use({apply() {}})
    await bud.api.processQueue()
    expect(Object.keys(bud.extensions.repository).length).toEqual(7)
  })

  it(`registers an imported webpack plugin`, async () => {
    bud.use(HTMLWebpackInstance)
    await bud.api.processQueue()
    expect(bud.extensions.has(`HtmlWebpackPlugin`)).toBe(true)
  })

  it(`registers multiple extensions`, async () => {
    bud.use([Babel, HTMLWebpackInstance])
    await bud.api.processQueue()
    expect(bud.extensions.has(`@roots/bud-babel`)).toBe(true)
    expect(bud.extensions.has(`HtmlWebpackPlugin`)).toBe(true)
  })

  it(`adds an apply plugin to the config`, async () => {
    const plugin = {
      label: `my-plugin`,
      apply() {
        // noop
      },
    }
    bud.use(plugin)
    await bud.api.processQueue()
    expect(bud.extensions.has(`my-plugin`)).toBe(true)
  })
})
