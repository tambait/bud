import {Extension} from '@roots/bud-framework/extension'
import {
  bind,
  dependsOn,
  dependsOnOptional,
  expose,
  label,
  options,
} from '@roots/bud-framework/extension/decorators'

/**
 * Sass support extension for `@roots/bud-sass`
 *
 * @public
 * @decorator `@label`
 * @decorator `@expose`
 * @decorator `@dependsOn`
 * @decorator `@dependsOnOptional`
 */
@label(`@roots/bud-sass`)
@dependsOn([`@roots/bud-sass/resolve-url`])
@dependsOnOptional([`@roots/bud-postcss`])
@options({
  implementation: null,
  sourceMap: true,
})
@expose(`sass`)
export default class BudSass extends Extension {
  /**
   * `register` callback
   *
   * @public
   * @decorator `@bind`
   */
  @bind
  public async register() {
    const implementation = await this.import(`sass`)
    this.setOptions({implementation, sourceMap: true})
  }

  /**
   * `configAfter` callback
   *
   * @public
   * @decorator `@bind`
   */
  @bind
  public async configAfter() {
    this.app.build
      .setLoader(`sass-loader`)
      .setItem(`sass`, {
        loader: `sass-loader`,
        options: this.options,
      })
      .setRule(`sass`, {
        test: app => app.hooks.filter(`pattern.sass`),
        include: [app => app.path(`@src`)],
        use: [`precss`, `css`, `postcss`, `resolveUrl`, `sass`],
      })

    this.app.hooks.on(`build.resolve.extensions`, ext =>
      ext.add(`.scss`).add(`.sass`),
    )

    if (this.app.postcss) {
      this.app.postcss.syntax = `postcss-scss`
    }
  }

  /**
   * Register global stylsheet
   *
   * @remarks
   * Used to register styles which are included globally
   *
   * @example
   * ```ts
   * bud.sass.registerGlobal(`$primary-color: #ff0000;`)
   * ```
   *
   * @public
   * @decorator `@bind`
   */
  @bind
  public registerGlobal(data: string | Array<string>): this {
    data = Array.isArray(data) ? data : [data]
    return this.setOption(`additionalData`, value =>
      [value ?? null, ...data].filter(Boolean).join(`\n`),
    )
  }

  /**
   * Import a partial globally
   *
   * @remarks
   * Used to import a partial globally (such as a `variables.scss` file)
   *
   * @example
   * ```ts
   * bud.sass.importPartial()
   * ```
   *
   * @public
   * @decorator `@bind`
   */
  @bind
  public importGlobal(data: string | Array<string>): this {
    data = Array.isArray(data) ? data : [data]
    return this.registerGlobal(data.map(item => `@import "${item}";`))
  }
}
