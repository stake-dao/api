import { fetchPendle } from '@stake-dao/reader'
import memoize from 'memoizee'
import { mainnet } from 'viem/chains'
import { MEMO_MAX_AGE, getPrices, publicClient } from '../utils'
import { RPC } from '../constants'
import { tokens } from '@stake-dao/constants'
import fs from 'fs'
import path from 'path'

require('dotenv').config()

interface GaugeHolder {
  user: string
  balance: string
}

interface Gauge {
  id: string
  holders: GaugeHolder[]
  holder_count: number
}

interface PendleGaugeHolders {
  'lp-holder': string
  gauge_count: number
  gauges: Gauge[]
}

export const getPendleMainnet = memoize(
  async () => {
    const prices = await getPrices(
      tokens.filter((t) => t.chainId === mainnet.id),
      mainnet.id,
    )

    return fetchPendle({
      prices,
      provider: publicClient[mainnet.id],
      rpc: RPC[mainnet.id],
      explorerApiKey: process.env.ETHERSCAN_TOKEN as string,
      explorer: 'etherscan.io',
      chainId: mainnet.id,
    })
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getPendle = memoize(async () => {
  const [pendleDataMainnet] = await Promise.all([getPendleMainnet()])

  return {
    lastUpdate: Math.floor(Date.now() / 1000),
    global: {
      [mainnet.id]: pendleDataMainnet.global,
    },
    deployed: [...pendleDataMainnet.deployed],
    notDeployed: [...pendleDataMainnet.notDeployed],
    fetched: true,
  }
})

export const getPendleGaugeHoldersMainnet = memoize(
  async (): Promise<PendleGaugeHolders | null> => {
    const filePath = path.join('api/strategies/pendle/holders/index.json')

    return new Promise((resolve) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(`Error reading file ${filePath}: ${err}`)
          resolve(null)
          return
        }

        try {
          const jsonData: PendleGaugeHolders = JSON.parse(data)
          resolve(jsonData)
        } catch (error) {
          console.error(`Error parsing JSON from ${filePath}: ${error}`)
          resolve(null)
        }
      })
    })
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getPendleGaugeHolders = memoize(
  async (): Promise<PendleGaugeHolders | null> => {
    const [pendleGaugeHolders] = await Promise.all([getPendleGaugeHoldersMainnet()])
    return pendleGaugeHolders
  },
  { maxAge: MEMO_MAX_AGE },
)


