import { arbitrum, mainnet } from 'viem/chains'
import { writeFile } from './utils'
import { getCurve, getCurveArbitrum, getCurveMainnet } from '../src/lib/strategies/curve'

const updateCurveStrats = async () => {
  const [curveDataMainnet, curveDataArbitrum, curveData] = await Promise.all([
    getCurveMainnet(),
    getCurveArbitrum(),
    getCurve(),
  ])

  writeFile({
    path: `api/strategies/curve/${mainnet.id}.json`,
    data: JSON.stringify(curveDataMainnet),
    log: {
      success: '✅ - Curve Mainnet strategies have been updated!',
      error: '❌ - An error occured during the Curve Mainnet strategies update.',
    },
  })

  writeFile({
    path: `api/strategies/curve/${arbitrum.id}.json`,
    data: JSON.stringify(curveDataArbitrum),
    log: {
      success: '✅ - Curve Arbitrum strategies have been updated!',
      error: '❌ - An error occured during the Curve Arbitrum strategies update.',
    },
  })

  writeFile({
    path: `api/strategies/curve/index.json`,
    data: JSON.stringify(curveData),
    log: {
      success: '✅ - Curve strategies have been updated!',
      error: '❌ - An error occured during the Curve strategies update.',
    },
  })
}

updateCurveStrats()
