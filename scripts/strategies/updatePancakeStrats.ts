import { arbitrum, bsc, mainnet } from 'viem/chains'
import { writeFile } from '../utils'
import { getPancake, getPancakeArbitrum, getPancakeBsc, getPancakeMainnet } from '../../src/lib/strategies/pancakeswap'

const updatePancakeStrats = async () => {
  const [pancakeDataMainnet, pancakeDataBsc, pancakeDataArbitrum, pancakeData] = await Promise.all([
    getPancakeMainnet(),
    getPancakeBsc(),
    getPancakeArbitrum(),
    getPancake(),
  ])

  writeFile({
    path: `api/strategies/pancakeswap/${mainnet.id}.json`,
    data: JSON.stringify(pancakeDataMainnet),
    log: {
      success: '✅ - PancakeSwap Mainnet strategies have been updated!',
      error: '❌ - An error occured during the PancakeSwap Mainnet strategies update.',
    },
  })

  writeFile({
    path: `api/strategies/pancakeswap/${bsc.id}.json`,
    data: JSON.stringify(pancakeDataBsc),
    log: {
      success: '✅ - PancakeSwap BSC strategies have been updated!',
      error: '❌ - An error occured during the PancakeSwap BSC strategies update.',
    },
  })

  writeFile({
    path: `api/strategies/pancakeswap/${arbitrum.id}.json`,
    data: JSON.stringify(pancakeDataArbitrum),
    log: {
      success: '✅ - PancakeSwap Arbitrum strategies have been updated!',
      error: '❌ - An error occured during the PancakeSwap Arbitrum strategies update.',
    },
  })

  writeFile({
    path: `api/strategies/pancakeswap/index.json`,
    data: JSON.stringify(pancakeData),
    log: {
      success: '✅ - PancakeSwap strategies have been updated!',
      error: '❌ - An error occured during the PancakeSwap strategies update.',
    },
  })
}

export default updatePancakeStrats
