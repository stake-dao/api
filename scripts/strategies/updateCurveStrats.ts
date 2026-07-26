import { arbitrum, mainnet } from 'viem/chains'
import { writeFile, writeFileFromPromise } from '../utils'
import { getCurve, getCurveArbitrum, getCurveMainnet } from '../../src/lib/strategies/curve'
import { getCurve_v2 } from '../../src/lib/strategies/v2'

const updateCurveStrats = async () => {
  const [curveDataMainnet, curveDataArbitrum, curveData] = await Promise.allSettled([
    getCurveMainnet(),
    getCurveArbitrum(),
    getCurve(),
  ])

  writeFileFromPromise({
    path: `api/strategies/curve/${mainnet.id}.json`,
    data: curveDataMainnet,
    log: {
      success: '✅ - Curve Mainnet strategies have been updated!',
      error: '❌ - An error occured during the Curve Mainnet strategies update.',
    },
  })

  writeFileFromPromise({
    path: `api/strategies/curve/${arbitrum.id}.json`,
    data: curveDataArbitrum,
    log: {
      success: '✅ - Curve Arbitrum strategies have been updated!',
      error: '❌ - An error occured during the Curve Arbitrum strategies update.',
    },
  })

  writeFileFromPromise({
    path: `api/strategies/curve/index.json`,
    data: curveData,
    log: {
      success: '✅ - Curve strategies have been updated!',
      error: '❌ - An error occured during the Curve strategies update.',
    },
  })

  // Written first, then raised. `writeFileFromPromise` skips a rejected entry, so the previously
  // published JSON is preserved — but swallowing the rejection here made the caller's exit code
  // useless: a hub outage on mainnet left this function resolving normally, `updateStrats.ts`
  // counting zero failures, and the workflow committing the other protocols with a green step.
  const rejected = [curveDataMainnet, curveDataArbitrum, curveData].filter((r) => r.status === 'rejected')
  if (rejected.length) {
    throw new AggregateError(
      rejected.map((r) => (r as PromiseRejectedResult).reason),
      `${rejected.length}/3 Curve strategy file(s) could not be produced`,
    )
  }
}

export const updateCurveStrats_v2 = async () => {
  const curveData = await getCurve_v2()
  const chains = Object.keys(curveData)

  for (const chainId of chains) {
    if (curveData[chainId].length > 0) {
      writeFile({
        path: `api/strategies/v2/curve/${chainId}.json`,
        data: JSON.stringify(curveData[chainId]),
        log: {
          success: `✅ - chainId ${chainId} - Curve strategies have been updated!`,
          error: `❌ - chainId ${chainId} - An error occured during the Curve strategies update.`,
        },
      })
    }
  }

  writeFile({
    path: `api/strategies/v2/curve/index.json`,
    data: JSON.stringify(chains.flatMap((chainId) => curveData[chainId])),
    log: {
      success: '✅ - Curve strategies have been updated!',
      error: '❌ - An error occured during the Curve strategies update.',
    },
  })
}

export default updateCurveStrats
