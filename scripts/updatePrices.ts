import { sleep, writeFile } from './utils'
import { tokens } from '@stake-dao/constants'
import { getPrices } from '@stake-dao/reader'
import curveStrats_v2 from '../api/strategies/v2/curve/index.json' with { type: 'json' }

const updatePrices = async () => {
  const chainTokens: { [chainId: number]: any[] } = {}
  const chainPrices: {
    [chainId: number]: {
      [tokenAddress: string]: { symbol: string; price: number }
    }
  } = {}

  for (const t of tokens) {
    if (typeof chainTokens[t.chainId] === 'undefined') {
      chainPrices[t.chainId] = {}
      chainTokens[t.chainId] = []
    }
    chainTokens[t.chainId].push(t)
  }

  const chainIds = Object.keys(chainTokens)

  for (const chainId of chainIds) {
    console.log('Processing chain', chainId)

    const prices = await getPrices(chainTokens[chainId], Number(chainId))
    for (const p of prices) chainPrices[chainId][p.address.toLowerCase()] = { symbol: p.symbol, price: p.usdPrice }

    sleep(2000)
  }

  for (const s of curveStrats_v2)
    chainPrices[s.chainId][s.lpToken.address.toLowerCase()] = { symbol: s.lpToken.symbol, price: s.lpPriceInUsd }

  const lastUtcTimestamp = Math.floor(Date.now() / 1000 / 86400) * 86400

  writeFile({
    path: `api/prices/${lastUtcTimestamp}.json`,
    data: JSON.stringify(chainPrices),
    log: {
      success: `✅ - ${lastUtcTimestamp} Prices have been updated!`,
      error: `❌ - An error occured during the ${lastUtcTimestamp} Prices update.`,
    },
  })

  writeFile({
    path: `api/prices/index.json`,
    data: JSON.stringify(chainPrices),
    log: {
      success: '✅ - Prices have been updated!',
      error: '❌ - An error occured during the Prices update.',
    },
  })
}

updatePrices()
