/**
 * Extension to be run in `development` mode
 *
 * @remarks
 * Extension decorator
 *
 * @public
 */
export const development = <Type extends {new (...args: any[]): any}>(
  constructor: Type,
) =>
  class extends constructor {
    public constructor(...args: any[]) {
      super(...args)
    }

    /**
     * `when` callback
     *
     * @returns `true` when mode is `development`
     * @public
     */
    public when({isDevelopment}) {
      return isDevelopment
    }
  }
