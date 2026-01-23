import { mainnet } from 'viem/chains'
import { writeFile } from '../utils'
import { getBalancer, getBalancerMainnet } from '../../src/lib/strategies/balancer'
import { getBalancer_v2 } from '../../src/lib/strategies/v2/balancer'

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

export const updateBalancerStrats_v2 = async () => {
  const balancerData = await getBalancer_v2()
  const chains = Object.keys(balancerData)

  for (const chainId of chains) {
    if (balancerData[chainId].length > 0) {
      writeFile({
        path: `api/strategies/v2/balancer/${chainId}.json`,
        data: JSON.stringify(balancerData[chainId]),
        log: {
          success: `✅ - chainId ${chainId} - Balancer strategies have been updated!`,
          error: `❌ - chainId ${chainId} - An error occured during the Balancer strategies update.`,
        },
      })
    }
  }

  writeFile({
    path: `api/strategies/v2/balancer/index.json`,
    data: JSON.stringify(chains.flatMap((chainId) => balancerData[chainId])),
    log: {
      success: '✅ - Balancer strategies have been updated!',
      error: '❌ - An error occured during the Balancer strategies update.',
    },
  })
}

export default updateBalancerStrats
