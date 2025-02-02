import type {Bud} from '../bud.js'

/**
 * @public
 */
export interface setPublicPath {
  (publicPath: string | ((publicPath: string) => string)): Bud
}

/**
 * Set the application public path (e.g. `/assets`)
 *
 * @remarks
 * The default public path is `/`
 *
 * @example
 * Set the default path using a string
 *
 * ```js
 * app.setPublicPath('/app/themes/sage/dist')
 * ```
 *
 * @example
 * Set the publicPath using a function.
 *
 * ```js
 * app.setPublicPath(publicPath => {
 *   return `web/assets/${publicPath}`
 * })
 * ```
 *
 * @see {@link https://bud.js.org/docs/bud.setPublicPath}
 *
 * @public
 */
export const setPublicPath: setPublicPath = function (publicPath) {
  const app = this as Bud

  app.hooks.on(`build.output.publicPath`, publicPath)

  return app
}
