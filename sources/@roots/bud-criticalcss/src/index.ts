// Copyright © Roots Software Foundation LLC
// Licensed under the MIT license.

/**
 * This extension wraps {@link @roots/critical-css-webpack-plugin#CriticalCSSPlugin | @roots/critical-css-webpack-plugin}
 * and provides criticalcss support.
 *
 * @beta
 * This extension is under active development. But it should not be considered stable and there may be breaking changes.
 *
 * @see https://bud.js.org
 * @see https://github.com/roots/bud
 *
 * @packageDocumentation
 */

import BudCriticalCssExtension from './extension.js'

declare module '@roots/bud-framework' {
  interface Bud {
    critical: BudCriticalCssExtension
  }

  interface Modules {
    '@roots/bud-criticalcss': BudCriticalCssExtension
  }
}

export default BudCriticalCssExtension
