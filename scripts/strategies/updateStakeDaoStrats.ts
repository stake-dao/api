import { mainnet } from 'viem/chains'
import { writeFile } from '../utils'
import { getStakeDao, getStakeDaoMainnet } from '../../src/lib/strategies/stakeDao'

const updateStakeDaoStrats = async () => {
  const [stakeDaoDataMainnet, stakeDaoData] = await Promise.all([getStakeDaoMainnet(), getStakeDao()])

  writeFile({
    path: `api/strategies/stakeDao/${mainnet.id}.json`,
    data: JSON.stringify(stakeDaoDataMainnet),
    log: {
      success: '✅ - Stake DAO Mainnet strategies have been updated!',
      error: '❌ - An error occured during the Stake DAO Mainnet strategies update.',
    },
  })

  writeFile({
    path: `api/strategies/stakeDao/index.json`,
    data: JSON.stringify(stakeDaoData),
    log: {
      success: '✅ - Stake DAO strategies have been updated!',
      error: '❌ - An error occured during the Stake DAO strategies update.',
    },
  })
}

export default updateStakeDaoStrats
