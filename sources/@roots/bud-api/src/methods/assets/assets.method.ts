import type {Bud} from '@roots/bud-framework'
import type CopyPlugin from 'copy-webpack-plugin'
import {relative} from 'path'

type FromToTuple = [CopyPlugin.StringPattern, CopyPlugin.StringPattern]

export interface facade {
  (
    request:
      | CopyPlugin.StringPattern
      | CopyPlugin.ObjectPattern
      | Array<CopyPlugin.StringPattern>
      | Array<FromToTuple>
      | Array<CopyPlugin.ObjectPattern>,
    overrides?: Partial<CopyPlugin.ObjectPattern>,
  ): Bud
}

export interface method {
  (
    request:
      | CopyPlugin.StringPattern
      | CopyPlugin.ObjectPattern
      | Array<CopyPlugin.StringPattern>
      | Array<FromToTuple>
      | Array<CopyPlugin.ObjectPattern>,
    overrides?: Partial<CopyPlugin.ObjectPattern>,
  ): Promise<Bud>
}

export const assets: method = async function assets(
  request,
  overrides = {},
) {
  /**
   * tsc will complain about `this` context being lost
   * when destructuring bud even though the context of
   * this function will be bound.
   */
  const app = this as Bud

  const makePatternObjectFromString = fromStringFactory(app, overrides)
  const makePatternObjectFromTuple = fromTupleFactory(app, overrides)

  const arrayedRequest = !Array.isArray(request) ? [request] : request

  const valueMapper = (
    item:
      | CopyPlugin.StringPattern
      | FromToTuple
      | CopyPlugin.ObjectPattern,
  ) => {
    if (typeof item === `string`) {
      const copyPluginStringPattern = item
      return makePatternObjectFromString(copyPluginStringPattern)
    }
    if (Array.isArray(item)) {
      const tuple: FromToTuple = item
      return makePatternObjectFromTuple(tuple)
    }
    return {...item, ...overrides}
  }

  app.extensions.get(`copy-webpack-plugin`).setOptions(options => ({
    ...(options ?? {}),
    patterns: [
      ...(options?.patterns ?? []),
      ...arrayedRequest.map(valueMapper),
    ],
  }))

  return app
}

/**
 * Take an input string and return a {@link CopyPlugin.ObjectPattern}
 *
 * @internal
 */
export const fromStringFactory =
  (app: Bud, overrides: Partial<CopyPlugin.ObjectPattern>) =>
  (from: string): CopyPlugin.ObjectPattern => ({
    from: from.startsWith(`/`) ? from : app.path(`@src`, from),
    to: from.startsWith(`/`)
      ? relative(app.path(`@src`), from)
      : app.path(`@dist`, from, `@file`),
    context: app.path(`@src`),
    noErrorOnMissing: true,
    toType: `template`,
    ...overrides,
  })

/**
 * Take an input [from,to] tuple and return a {@link CopyPlugin.ObjectPattern}
 *
 * @internal
 */
export const fromTupleFactory =
  (app: Bud, overrides: Partial<CopyPlugin.ObjectPattern>) =>
  ([from, to]: [string, string]): CopyPlugin.ObjectPattern => ({
    from: from.startsWith(`/`) ? from : app.path(`@src`, from),
    to: to.startsWith(`/`) ? to : app.path(`@dist`, to, `@file`),
    context: app.path(`@src`),
    noErrorOnMissing: true,
    toType: `template`,
    ...overrides,
  })
