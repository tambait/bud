import type {Bud} from '@roots/bud-framework'
import {Extension} from '@roots/bud-framework/extension'
import {
  bind,
  expose,
  label,
  options,
} from '@roots/bud-framework/extension/decorators'
import {
  isFunction,
  isString,
  isUndefined,
} from '@roots/bud-support/lodash-es'
import Webpack from 'webpack'

/**
 * `esm-http` extension options
 *
 * @public
 */
export interface Options {
  allowedUris?: Array<string | RegExp | ((uri: string) => boolean)>
  cacheLocation: false | string
  frozen: boolean
  lockfileLocation: string
  proxy: string
  upgrade: boolean
}

/**
 * Include remote modules in compilation
 *
 * @public
 * @decorator `@label`
 * @decorator `@expose`
 * @decorator `@options`
 */
@label(`cdn`)
@expose(`cdn`)
@options<Options>({
  allowedUris: [],
  cacheLocation: (app: Bud) => app.path(`@storage`, app.label, `modules`),
  frozen: false,
  lockfileLocation: (app: Bud): string =>
    app.path(`@storage`, app.label, `bud.lock`),
  proxy: ({env}) => env.isString(`HTTP_PROXY`) && env.get(`HTTP_PROXY`),
  upgrade: true,
})
export default class Cdn extends Extension<Options, null> {
  /**
   * CDN manifest key to URL mapping
   *
   * @public
   */
  public sources = new Map<string, string>([
    [`gist`, `https://gist.githubusercontent.com/`],
    [`github`, `https://raw.githubusercontent.com/`],
    [`unpkg`, `https://unpkg.com/`],
    [`skypack`, `https://cdn.skypack.dev/`],
  ])

  /**
   * Whether to cache modules locally
   *
   * @public
   */
  public cacheEnabled = true

  /**
   * Disable local caching of modules
   *
   * @public
   */
  @bind
  public disableCache(): this {
    this.cacheEnabled = false
    return this
  }

  /**
   * Register CDN
   *
   * @public
   */
  @bind
  public registerSource(name: string, url: string): this {
    this.sources.set(name, url)
    return this
  }

  /**
   * Allowed URIs getter/setter
   *
   * @public
   */
  public get allowedUris(): Array<
    string | RegExp | ((uri: string) => boolean)
  > {
    return Array.from(
      new Set([
        ...(this.app.maybeCall(this.getOption(`allowedUris`)) ?? []),
        ...(this.sources.values() ?? []),
      ]),
    ).filter(
      v => typeof v === `string` || v instanceof RegExp || isFunction(v),
    )
  }
  public set allowedUris(
    value:
      | Array<string | RegExp | ((uri: string) => boolean)>
      | Options['allowedUris'],
  ) {
    this.setOption(`allowedUris`, value)
  }

  /**
   * Cache location getter/setter
   *
   * @public
   */
  public get cacheLocation(): string | false {
    return this.app.maybeCall(this.getOption(`cacheLocation`))
  }
  public set cacheLocation(
    value: string | false | Options['cacheLocation'],
  ) {
    this.setOption(`cacheLocation`, value)
  }

  /**
   * Frozen getter/setter
   *
   * @public
   */
  public get frozen(): boolean {
    return this.app.maybeCall(this.getOption(`frozen`))
  }
  public set frozen(value: boolean) {
    this.setOption(`frozen`, value)
  }

  /**
   * Lockfile location getter/setter
   *
   * @public
   */
  public get lockfileLocation(): string {
    return this.getOption(`lockfileLocation`)
  }
  public set lockfileLocation(
    value: string | Options['lockfileLocation'],
  ) {
    this.setOption(`lockfileLocation`, value)
  }

  /**
   * Proxy getter/setter
   *
   * @public
   */
  public get proxy(): string {
    return this.app.maybeCall(this.getOption(`proxy`))
  }
  public set proxy(value: string | Options['proxy']) {
    this.setOption(`proxy`, value)
  }

  /**
   * Upgrade location getter/setter
   *
   * @public
   */
  public get upgrade(): boolean {
    return this.app.maybeCall(this.getOption(`upgrade`))
  }
  public set upgrade(value: boolean | Options['upgrade']) {
    this.setOption(`upgrade`, value)
  }

  /**
   * Set allowed URLs
   *
   * @public
   * @decorator `@bind`
   */
  @bind
  public setAllowedUris(
    value:
      | Array<string | RegExp | ((uri: string) => boolean)>
      | Options['allowedUris'],
  ): this {
    this.allowedUris = value
    return this
  }

  /**
   * Set cache location
   *
   * @public
   * @decorator `@bind`
   */
  @bind
  public setCacheLocation(value: string | Options['cacheLocation']): this {
    this.cacheLocation = value
    return this
  }

  /**
   * Freeze?
   *
   * @public
   * @decorator `@bind`
   */
  @bind
  public freeze(value?: boolean): this {
    this.frozen = !isUndefined(value) ? value : true
    return this
  }

  /**
   * Set lockfile location
   *
   * @public
   * @decorator `@bind`
   */
  @bind
  public setLockfileLocation(
    value: string | Options['lockfileLocation'],
  ): this {
    this.lockfileLocation = value
    return this
  }

  /**
   * Set proxy location
   *
   * @public
   * @decorator `@bind`
   */
  @bind
  public setProxy(value: string | Options['proxy']): this {
    this.proxy = value
    return this
  }

  /**
   * Set upgrade
   *
   * @public
   * @decorator `@bind`
   */
  @bind
  public setUpgrade(value: boolean | Options['upgrade']): this {
    this.upgrade = value
    return this
  }

  @bind
  public async beforeBuild() {
    for (const cdnKey of this.sources.keys()) {
      this.logger.log(`registering`, cdnKey)
      this.app.context.manifest?.bud?.[cdnKey] && this.enable()
    }
  }

  /**
   * `buildBefore` callback
   *
   * @public
   * @decorator `@bind`
   */
  @bind
  public async buildBefore() {
    this.app.hooks.on(`build.experiments`, experiments => ({
      ...(experiments ?? {}),
      buildHttp: {
        allowedUris: this.allowedUris,
        cacheLocation: this.cacheEnabled ? this.cacheLocation : false,
        frozen: this.frozen,
        lockfileLocation: this.lockfileLocation,
        proxy: isString(this.proxy) ? this.proxy : undefined,
        upgrade: this.upgrade,
      },
    }))

    for (const source of this.sources.entries()) {
      const cdn = {
        ident: source[0],
        url: source[1],
        schema: `${source[0]}:`,
      }

      await this.app.extensions.add({
        label: `bud-cdn-${cdn.ident}`,
        make: async () =>
          new Webpack.NormalModuleReplacementPlugin(
            new RegExp(`^${cdn.schema}`),
            result => {
              result.request = result.request.replace(cdn.schema, cdn.url)
            },
          ),
      })

      if (isUndefined(this.app.context.manifest?.bud?.[cdn.ident])) return

      const manifest = this.app.context.manifest.bud[cdn.ident]
      const imports = Array.isArray(manifest)
        ? manifest.map(signifier => [signifier, signifier])
        : Object.entries(manifest).map(([base, params]) => [
            base,
            `${base}@${params}`,
          ])

      await Promise.all(
        imports.map(async ([signifier, remotePath]) => {
          await this.app.extensions.add({
            label: `bud-cdn-${cdn.ident}-${remotePath}`,
            make: async () =>
              new Webpack.NormalModuleReplacementPlugin(
                new RegExp(`^${signifier}`),
                result => {
                  result.request = result.request.replace(
                    signifier,
                    [cdn.url, remotePath].join(``),
                  )
                },
              ),
          })
        }),
      )
    }
  }
}
