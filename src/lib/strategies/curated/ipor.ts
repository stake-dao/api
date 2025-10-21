import { fetchIporVaults } from '@stake-dao/reader'
import memoize from 'memoizee'
import { arbitrum, mainnet } from 'viem/chains'
import { MEMO_MAX_AGE, publicClient } from '../../utils'

require('dotenv').config()

export const getIporArbitrum = memoize(
  async () =>
    fetchIporVaults({
      provider: publicClient[arbitrum.id],
      chainId: arbitrum.id,
    }),
  { maxAge: MEMO_MAX_AGE },
)

export const getIpor = memoize(async () => {
  const [iporArbitrum] = await Promise.all([getIporArbitrum()])

  return [...iporArbitrum]
})
