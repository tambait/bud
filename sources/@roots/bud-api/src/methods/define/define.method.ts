import type {Bud} from '@roots/bud-framework'
import type {DefinePlugin} from 'webpack'

export interface define {
  (values: DefinePlugin['definitions']): Bud
}

export function define(values: DefinePlugin['definitions']): Bud {
  const app = this as Bud

  app.extensions
    .get(`webpack:define-plugin`)
    .setOptions((definitions: DefinePlugin['definitions']) => ({
      ...definitions,
      ...values,
    }))

  return app
}
