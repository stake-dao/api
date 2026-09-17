import { mainnet } from 'viem/chains'
import { writeFile } from '../utils'
import { getYearn, getYearnMainnet } from '../../src/lib/strategies/yearn'

const updateYearnStrats = async () => {
  const [yearnDataMainnet, yearnData] = await Promise.all([getYearnMainnet(), getYearn()])

  writeFile({
    path: `api/strategies/yearn/${mainnet.id}.json`,
    data: JSON.stringify(yearnDataMainnet),
    log: {
      success: '✅ - Yearn Mainnet strategies have been updated!',
      error: '❌ - An error occured during the Yearn Mainnet strategies update.',
    },
  })

  writeFile({
    path: `api/strategies/yearn/index.json`,
    data: JSON.stringify(yearnData),
    log: {
      success: '✅ - Yearn strategies have been updated!',
      error: '❌ - An error occured during the Yearn strategies update.',
    },
  })
}

export default updateYearnStrats
