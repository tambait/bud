import type {StatsCompilation} from 'webpack'

export interface Payload {
  name: StatsCompilation['name']
  action: 'building' | 'built' | 'sync' | 'reload'
  time: number
  hash: string
  warnings: StatsCompilation['warnings']
  errors: StatsCompilation['errors']
}
