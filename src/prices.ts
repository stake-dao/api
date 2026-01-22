import { tokenWithId, tokens } from '@stake-dao/constants'
import { chunk } from '../scripts/utils'
import { getPricesFromGeckoTerminal } from '@stake-dao/reader'

const getLlamaChainPrefix = (chainId: number) => {
  switch (chainId) {
    case 1:
      return 'ethereum'
    case 10:
      return 'optimism'
    case 56:
      return 'bsc'
    case 137:
      return 'polygon'
    case 146:
      return 'sonic'
    case 252:
      return 'fraxtal'
    case 42161:
      return 'arbitrum'
    case 8453:
      return 'base'
    default:
      return 'ethereum'
  }
}

export const fetchPrices = async (tokensToFetch = tokens) => {
  const chunkedTokens = chunk(tokensToFetch, 130)
  const parsedPrice: any[] = []

  for (const tokenChunk of chunkedTokens) {
    const httpArgs = tokenChunk.map((t) => `${getLlamaChainPrefix(t.chainId)}:${t.address}`).toString()
    const httpRequest = await fetch(`https://coins.llama.fi/prices/current/${httpArgs}`)
    const httpResponse = await httpRequest.json()
    const coinsData = httpResponse.coins

    parsedPrice.push(
      ...tokenChunk.map((t) => ({
        symbol: t.symbol,
        address: t.address,
        usdPrice: coinsData[`${getLlamaChainPrefix(t.chainId)}:${t.address}`]
          ? coinsData[`${getLlamaChainPrefix(t.chainId)}:${t.address}`].price
          : 0,
      })),
    )
  }

  let parsedPriceWithSdTokens: any[] = parsedPrice
  try {
    parsedPriceWithSdTokens = [
      ...parsedPrice,
      {
        symbol: 'ETH',
        address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        usdPrice: parsedPrice.find((p) => p.symbol === 'WETH').usdPrice,
      },
    ]
  } catch {}

  let returnPrice = parsedPriceWithSdTokens

  const ethCrvUsd = tokenWithId('crvusd')!
  const arbCrvUsd = tokenWithId('crvusd', 42161)!
  const arbCrvUsdPrice = parsedPriceWithSdTokens.find((p) => p.address === arbCrvUsd.address)
  if (!arbCrvUsdPrice || arbCrvUsdPrice.usdPrice === 0) {
    const ethCrvUsdPrice = parsedPriceWithSdTokens.find((p) => p.address === ethCrvUsd.address)
    returnPrice = [
      ...parsedPriceWithSdTokens.filter((p) => p.address !== arbCrvUsd.address),
      {
        symbol: arbCrvUsd.symbol,
        address: arbCrvUsd.address,
        usdPrice: ethCrvUsdPrice?.usdPrice || 0,
      },
    ]
  }

  const dYfi = tokenWithId('dyfi')!
  const dYfiPrice = parsedPriceWithSdTokens.find((p) => p.symbol === dYfi.symbol)
  if (!dYfiPrice || dYfiPrice.usdPrice === 0) {
    const priceFromGeckoTerminal = await getPricesFromGeckoTerminal([dYfi.address])
    returnPrice = [
      ...parsedPriceWithSdTokens.filter((p) => p.symbol !== dYfi.symbol),
      {
        symbol: dYfi.symbol,
        address: dYfi.address,
        usdPrice: Number(priceFromGeckoTerminal[dYfi.address.toLowerCase()]),
      },
    ]
  }

  return returnPrice
}
