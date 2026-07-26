import { mainnet, polygon } from 'viem/chains'
import { writeFileFromPromise } from '../utils'
import { getPassive, getPassiveMainnet, getPassivePolygon } from '../../src/lib/strategies/passive'

const updatePassiveStrats = async () => {
  const [passiveDataMainnet, passiveDataPolygon, passiveData] = await Promise.allSettled([
    getPassiveMainnet(),
    getPassivePolygon(),
    getPassive(),
  ])

  writeFileFromPromise({
    path: `api/strategies/passive/${mainnet.id}.json`,
    data: passiveDataMainnet,
    log: {
      success: '✅ - Passive Mainnet strategies have been updated!',
      error: '❌ - An error occured during the Passive Mainnet strategies update.',
    },
  })

  writeFileFromPromise({
    path: `api/strategies/passive/${polygon.id}.json`,
    data: passiveDataPolygon,
    log: {
      success: '✅ - Passive Polygon strategies have been updated!',
      error: '❌ - An error occured during the Passive Polygon strategies update.',
    },
  })

  writeFileFromPromise({
    path: `api/strategies/passive/index.json`,
    data: passiveData,
    log: {
      success: '✅ - Passive strategies have been updated!',
      error: '❌ - An error occured during the Passive strategies update.',
    },
  })

  // Same reason as `updateCurveStrats`: the previous JSON is preserved by the writer, but the
  // rejection has to reach `updateStrats.ts` for the workflow step to fail and the commit to be
  // skipped. Swallowed here, the exit code never fired.
  const rejected = [passiveDataMainnet, passiveDataPolygon, passiveData].filter((r) => r.status === 'rejected')
  if (rejected.length) {
    throw new AggregateError(
      rejected.map((r) => (r as PromiseRejectedResult).reason),
      `${rejected.length}/3 passive strategy file(s) could not be produced`,
    )
  }
}

export default updatePassiveStrats
