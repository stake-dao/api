import memoize from 'memoizee'
import { groupBy } from 'lodash-es'
import { MEMO_MAX_AGE } from '../utils'

require('dotenv').config()

export const getStratsFromHub = memoize(
  async () => {
    const stratsFromGraph = await fetch('https://data-hub.contact-69d.workers.dev/v1/vaults').then((res) => res.json())
    return stratsFromGraph
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getCurve_v2 = memoize(async () => {
  const strats = await getStratsFromHub()
  return groupBy(strats.filter((r) => r.protocol === 'curve'), 'chainId')
})

export const getBalancer_v2 = memoize(async () => {
  const strats = await getStratsFromHub()
  return groupBy(strats.filter((r) => r.protocol === 'balancer'), 'chainId')
})

