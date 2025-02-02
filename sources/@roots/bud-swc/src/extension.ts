import type {Bud} from '@roots/bud-framework/bud'
import {Extension} from '@roots/bud-framework/extension'
import {
  bind,
  expose,
  label,
  options,
} from '@roots/bud-framework/extension/decorators'
import * as fs from '@roots/bud-support/fs'

/**
 * Transpile JS and TS with `swc-loader`
 *
 * @public
 * @decorator `@label`
 * @decorator `@options`
 */
@label(`@roots/bud-swc`)
@options({parseMap: false})
@expose(`swc`)
export default class BudSWC extends Extension {
  /**
   * `register` callback
   *
   * @public
   * @decorator `@bind`
   */
  @bind
  public async register() {
    this.app.hooks.on(`build.resolve.extensions`, ext =>
      ext.add(`.ts`).add(`.tsx`),
    )
  }

  /**
   * `buildBefore` callback
   *
   * @public
   * @decorator `@bind`
   */
  @bind
  public async buildBefore() {
    await this.registerSWC(this.app)
  }

  /**
   * Register SWC with the build service
   *
   * @public
   * @decorator `@bind`
   */
  @bind
  public async registerSWC(bud: Bud) {
    await this.hasRC()
      .then(hasRc => {
        if (hasRc) return

        this.setOptions(options => ({
          ...options,
          jsc: {
            ...(options.jsc ?? {}),
            parser: {
              ...(options.jsc?.parser ?? {}),
              syntax: `typescript`,
              jsx: true,
              tsx: true,
              decorators: false,
              dynamicImport: true,
            },
          },
        }))
      })
      .finally(() => {
        bud.build
          .setLoader(`swc`, `swc-loader`)
          .setItem(`swc`, {
            loader: `swc`,
            options: this.options,
          })
          .setRule(`ts`, {
            test: ({hooks}) => hooks.filter(`pattern.ts`),
            include: [({path}) => path(`@src`)],
            use: [`swc`],
          })
          .rules.js.setUse([`swc`])
      })
  }

  @bind
  public async hasRC() {
    return await fs.pathExists(this.app.path(`./.swcrc`))
  }
}
