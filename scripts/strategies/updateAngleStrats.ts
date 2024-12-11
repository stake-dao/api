import { mainnet } from 'viem/chains'
import { writeFile } from '../utils'
import { getAngle, getAngleMainnet } from '../../src/lib/strategies/angle'

const updateAngleStrats = async () => {
  const [angleDataMainnet, angleData] = await Promise.all([getAngleMainnet(), getAngle()])

  writeFile({
    path: `api/strategies/angle/${mainnet.id}.json`,
    data: JSON.stringify(angleDataMainnet),
    log: {
      success: '✅ - Angle Mainnet strategies have been updated!',
      error: '❌ - An error occured during the Angle Mainnet strategies update.',
    },
  })

  writeFile({
    path: `api/strategies/angle/index.json`,
    data: JSON.stringify(angleData),
    log: {
      success: '✅ - Angle strategies have been updated!',
      error: '❌ - An error occured during the Angle strategies update.',
    },
  })
}

export default updateAngleStrats
