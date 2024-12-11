import { arbitrum, mainnet } from 'viem/chains'
import { writeFileFromPromise } from '../utils'
import { getCurve, getCurveArbitrum, getCurveMainnet } from '../../src/lib/strategies/curve'

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
}

export default updateCurveStrats
