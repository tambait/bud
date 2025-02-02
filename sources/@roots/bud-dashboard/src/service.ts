/* eslint-disable no-console */
import {Service} from '@roots/bud-framework/service'
import type * as Services from '@roots/bud-framework/services'
import {bind} from '@roots/bud-support/decorators'
import type * as Ink from '@roots/bud-support/ink'
import type {StatsCompilation} from 'webpack'

/**
 * Dashboard service
 *
 * @public
 */
export class Dashboard
  extends Service
  implements Services.Dashboard.Service
{
  /**
   * Service label
   *
   * @public
   */
  public static label = `dashboard`

  /**
   * Ink instance
   * @public
   */
  public instance: Ink.Instance

  /**
   * Last hash
   *
   * @public
   */
  public lastHash: string

  /**
   * Build progress
   *
   * @public
   */
  public percentage: number = 0

  /**
   * log to stdout
   *
   * @public
   * @decorator `@bind`
   */
  @bind
  public log(...strings: Array<string>): void {
    this.app.context.stdout.write(strings.join(``))
  }

  /**
   * Run dashboard
   *
   * @public
   * @decorator `@bind`
   */
  @bind
  public async stats({
    stats: compilationStats,
  }: {
    stats: StatsCompilation
  }): Promise<this> {
    if (!compilationStats) return this

    if (this.app.context.args.log === false) {
      if (compilationStats.hasErrors() && this.app.isProduction)
        this.app.fatal(new Error(`compilation completed but had errors`))
      return
    }

    if (this.app.context.args.ci) {
      this.log(compilationStats?.toString())
      if (compilationStats.hasErrors() && this.app.isProduction)
        this.app.fatal(new Error(`compilation completed but had errors`))

      return this
    }

    try {
      const {renderDashboard} = await import(`./render/renderer.js`)

      const stats: StatsCompilation = compilationStats.toJson(`all`)

      if (!stats || stats.hash === this.lastHash) return this
      this.lastHash = stats.hash
      this.instance = renderDashboard({
        stats,
        app: this.app,
      })
      await this.instance.waitUntilExit()
    } catch (error) {
      this.log(compilationStats?.toString())
      throw error
    }

    if (compilationStats.hasErrors() && this.app.isProduction)
      this.app.fatal(new Error(`compilation completed but had errors`))

    return this
  }
}
