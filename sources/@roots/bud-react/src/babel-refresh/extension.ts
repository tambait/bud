import {Extension} from '@roots/bud-framework/extension'
import {
  bind,
  development,
  label,
} from '@roots/bud-framework/extension/decorators'

/**
 * Register `react-refresh-typescript` transform with TSC compiler
 *
 * @remarks
 * Used when `@roots/bud-typescript` is being used with babel loader
 * disabled
 *
 * @public
 * @decorator `@label`
 * @decorator `@development`
 */
@label(`@roots/bud-react/babel-refresh`)
@development
export default class BudBabelRefresh extends Extension {
  /**
   * `init` callback
   *
   * @public
   * @decorator `@bind`
   */
  @bind
  public async init() {
    this.logger.log(`Registering react-refresh-babel transformer`)

    if (!this.app.react.useBabel) return
    await this.app.react.ensureBabelIsLoaded()

    this.app.babel.setPlugin(
      `react-refresh/babel`,
      await this.resolve(`react-refresh/babel`),
    )
  }
}
