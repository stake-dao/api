import memoize from 'memoizee'
import { MEMO_MAX_AGE } from './utils'

require('dotenv').config()

export const getIncentives = memoize(
  async () => {
    const hookIncentives = await fetch('https://raw.githubusercontent.com/stake-dao/merkl-toolkit/refs/heads/main/data/incentives.json').then(
      (res) => res.json(),
    )

    return hookIncentives.filter((incentive) => !incentive.ended)
  },
  { maxAge: MEMO_MAX_AGE },
)
