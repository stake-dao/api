import { arbitrum, mainnet } from 'viem/chains'
import { writeFile } from './utils'
import { getCurve, getCurveArbitrum, getCurveMainnet } from '../src/lib/strategies/curve'

const main = async () => {
  const [curveDataMainnet, curveDataArbitrum, curveData] = await Promise.all([
    getCurveMainnet(),
    getCurveArbitrum(),
    getCurve(),
  ])

  // Write curve files
  writeFile(`api/strategies/curve/${mainnet.id}.json`, JSON.stringify(curveDataMainnet), {
    success: '✅ - Curve Mainnet strategies have been updated!',
    error: '❌ - An error occured on Curve Mainnet strategies update.',
  })

  writeFile(`api/strategies/curve/${arbitrum.id}.json`, JSON.stringify(curveDataArbitrum), {
    success: '✅ - Curve Arbitrum strategies have been updated!',
    error: '❌ - An error occured on Curve Arbitrum strategies update.',
  })

  writeFile(`api/strategies/curve/index.json`, JSON.stringify(curveData), {
    success: '✅ - Curve strategies have been updated!',
    error: '❌ - An error occured on Curve strategies update.',
  })
}

main()
