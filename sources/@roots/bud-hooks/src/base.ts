import type {Bud} from '@roots/bud-framework/src'
import {bind} from '@roots/bud-support/decorators'
import {isUndefined} from '@roots/bud-support/lodash-es'

/**
 * Synchronous hooks registry
 *
 * @remarks
 * Supports sync values
 *
 * @public
 */
export default abstract class Hooks<Store> {
  public _app: () => Bud

  public get app(): Bud {
    return this._app()
  }

  /**
   * Hooks store
   *
   * @public
   */
  public store: Store

  /**
   * Class constructor
   *
   * @public
   */
  public constructor(app: Bud) {
    this._app = () => app
    this.store = {} as Store
  }

  /**
   * Check if a hook has been set somewhere
   * @public
   */
  @bind
  public has<T extends keyof Store & string>(path: T): boolean {
    return isUndefined(this.store[path]) === false
  }
}
