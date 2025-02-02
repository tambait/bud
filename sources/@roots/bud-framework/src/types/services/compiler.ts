import type {
  Configuration,
  MultiCompiler as WebpackMultiCompiler,
  MultiStats,
  ProgressPlugin,
  Stats,
  StatsCompilation,
} from 'webpack'

import type {Service as BaseService} from '../../service'

/**
 * Compiler service interface
 *
 * @remarks
 * Compiles {@link @roots/bud-Bud#Build.config | Build config}
 * and reports on stats, progress, and errors encountered during compilation.
 *
 * @public
 */
interface Service extends BaseService {
  implementation: Implementation

  /**
   * The compiler instance
   *
   * @public
   */
  instance: WebpackMultiCompiler

  config: Array<Configuration>

  /**
   * Contains compilation stats, if available.
   *
   * @public
   */
  stats: StatsCompilation

  /**
   * Returns a {@link WebpackMultiCompiler} instance
   *
   * @example
   * ```js
   * bud.compiler.compile()
   * ```
   *
   * @example
   * ```js
   * bud.compiler.compile([{
   *   entry: {app: 'foo.js'}
   * }])
   * ```
   *
   * @public
   */
  compile(): Promise<WebpackMultiCompiler>

  callback(error: Error, stats: Stats & MultiStats): void

  handleStats(stats: Stats & MultiStats): void

  onError(error: any): void
}

export type BudError = {
  file: string
  line: number
  column: number
  message: string
  type: 'syntax' | 'export'
}
export type Config = Configuration
export type Implementation = (...params: any[]) => any

export type Progress = [number, string]

export namespace Progress {
  export type Handler = ProgressPlugin['handler']
}

export {Service}
