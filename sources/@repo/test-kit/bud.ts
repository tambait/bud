/* eslint-disable n/no-process-env */
import {paths} from '@repo/constants'
import Bud from '@roots/bud'
import {factory as makeInstance} from '@roots/bud/factory'
import type * as Options from '@roots/bud-framework/options'
import {join} from 'node:path'

export const repoPath = (...path: Array<string>) =>
  join(paths.root, ...(path ?? []))

export const mockProject = {
  path: repoPath(`tests`, `util`, `project`),
}

export const factory = async (
  overrides?: Partial<Options.Context>,
  skipConfig = true,
): Promise<Bud> => {
  process.env.BUD_TEST_ENV = `true`

  const bud = await makeInstance(
    {
      basedir: mockProject.path,
      mode: `production`,
      ...(overrides ?? {}),
      args: {
        dry: true,
        log: false,
        ...(overrides?.args ?? {}),
      },
    },
    true,
  )

  if (!skipConfig) await bud.run()

  return bud
}

export {Bud}
