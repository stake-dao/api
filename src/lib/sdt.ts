import { fetchLegacySdt, fetchSdt } from '@stake-dao/reader'
import memoize from 'memoizee'
import { mainnet } from 'viem/chains'
import { MEMO_MAX_AGE, getPrices, publicClient } from './utils'
import { sdt, tokens } from '@stake-dao/constants'
import { readFile } from '../../scripts/utils'
import dayjs from 'dayjs'
import { formatUnits } from 'viem'

require('dotenv').config()
const BUYBACK_FILE_PATH = 'api/sdt/buyback.json'

export const getPricesForSdtData = memoize(
  async () => {
    const prices = await getPrices(
      tokens.filter((t) => t.chainId === mainnet.id && ['usdc', 'sdt'].includes(t.id)),
      mainnet.id,
    )

    return prices
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getSdtData = memoize(
  async () => {
    const prices = await getPricesForSdtData()

    return fetchSdt({
      provider: publicClient[mainnet.id],
      prices,
      explorerApiKey: process.env.ETHERSCAN_TOKEN as string,
    })
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getLegacySdtData = memoize(
  async () => {
    const prices = await getPricesForSdtData()

    return fetchLegacySdt({
      provider: publicClient[mainnet.id],
      prices,
      explorerApiKey: process.env.ETHERSCAN_TOKEN as string,
    })
  },
  { maxAge: MEMO_MAX_AGE },
)

export const getSdtBuybackData = memoize(
  async () => {
    const current = readFile({ path: BUYBACK_FILE_PATH })

    const cowswap = await fetch("https://api.cow.fi/mainnet/api/v1/account/0xF930EBBd05eF8b25B1797b9b2109DDC9B0d43063/orders?offset=0&limit=100").then(res => res.json())

    const now = dayjs()
    const lastUpdate = dayjs(current.lastUpdate * 1000)

    const tmpOrders = current.orders
    let totalBuyback = BigInt(current.totalBuyback)
    let totalBuybackUsd = current.totalBuybackUsd

    for (const order of cowswap) {
      if (order.buyToken.toLowerCase() === sdt?.address.toLowerCase()) {
        const orderTs = dayjs(order.creationDate)
        const orderUnixTs = orderTs.unix()

        if (orderTs.isAfter(lastUpdate)) {
          const prices = await fetch(`https://coins.llama.fi/prices/historical/${orderUnixTs}/coingecko:stake-dao,ethereum:${order.sellToken}`).then(res => res.json())
          const sdtPrice = prices?.coins?.["coingecko:stake-dao"]?.price || 0
          const sellTokenPrice = prices?.coins?.[`ethereum:${order.sellToken}`]?.price || 0

          const buyAmount = BigInt(order.executedBuyAmount)
          const buyAmountUsd = Number(formatUnits(buyAmount, 18)) * sdtPrice

          totalBuyback += buyAmount
          totalBuybackUsd += buyAmountUsd

          tmpOrders.push({
            uid: order.uid,
            timestamp: orderUnixTs,
            sell: {
              token: order.sellToken,
              price: sellTokenPrice,
              amount: order.executedSellAmount,
              amountUsd: Number(formatUnits(BigInt(order.executedSellAmount), order.executedSellAmount.length > 13 ? 18 : 6)) * sellTokenPrice,
            },
            buy: {
              token: order.buyToken,
              price: sdtPrice,
              amount: order.executedBuyAmount,
              amountUsd: buyAmountUsd,
            }
          })
        }
      }
    }

    return {
      lastUpdate: now.unix(),
      txs: tmpOrders.length,
      totalBuyback: formatUnits(totalBuyback, 0),
      totalBuybackFormat: formatUnits(totalBuyback, 18),
      totalBuybackUsd,
      orders: tmpOrders
    }
  },
  { maxAge: MEMO_MAX_AGE },
)

