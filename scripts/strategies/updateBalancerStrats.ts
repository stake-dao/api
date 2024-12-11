import { mainnet } from 'viem/chains'
import { writeFile } from '../utils'
import { getBalancer, getBalancerMainnet } from '../../src/lib/strategies/balancer'

const updateBalancerStrats = async () => {
  const [balancerDataMainnet, balancerData] = await Promise.all([getBalancerMainnet(), getBalancer()])

  writeFile({
    path: `api/strategies/balancer/${mainnet.id}.json`,
    data: JSON.stringify(balancerDataMainnet),
    log: {
      success: '✅ - Balancer Mainnet strategies have been updated!',
      error: '❌ - An error occured during the Balancer Mainnet strategies update.',
    },
  })

  writeFile({
    path: `api/strategies/balancer/index.json`,
    data: JSON.stringify(balancerData),
    log: {
      success: '✅ - Balancer strategies have been updated!',
      error: '❌ - An error occured during the Balancer strategies update.',
    },
  })
}

export default updateBalancerStrats
