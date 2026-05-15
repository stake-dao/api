import { mainnet } from 'viem/chains'
import { writeFile } from '../utils'
import { getPendle, getPendleMainnet } from '../../src/lib/strategies/pendle'

const updatePendleStrats = async () => {
  const [pendleDataMainnet, pendleData] = await Promise.all([getPendleMainnet(), getPendle()])

  writeFile({
    path: `api/strategies/pendle/${mainnet.id}.json`,
    data: JSON.stringify(pendleDataMainnet),
    log: {
      success: '✅ - Pendle Mainnet strategies have been updated!',
      error: '❌ - An error occured during the Pendle Mainnet strategies update.',
    },
  })

  writeFile({
    path: `api/strategies/pendle/index.json`,
    data: JSON.stringify(pendleData),
    log: {
      success: '✅ - Pendle strategies have been updated!',
      error: '❌ - An error occured during the Pendle strategies update.',
    },
  })
}

export default updatePendleStrats
