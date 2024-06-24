import fs from 'fs'
import { tokens } from '@stake-dao/constants'
import { type SdtEmissionData, getPricesFromLlama, fetchCurve, getSdtInflationData, getGaugesWeights } from '@stake-dao/reader'
import { http, createPublicClient } from 'viem'
import { bsc, mainnet } from 'viem/chains'
require('dotenv').config()

const main = async () => {

  const publicClient = {
    [mainnet.id]: createPublicClient({
      chain: mainnet,
      transport: http(),
    }),
    [bsc.id]: createPublicClient({
      chain: bsc,
      transport: http(),
    }),
  };

  const prices = await getPricesFromLlama(tokens.filter((t) => t.chainId === 1))
  const sdtEmissionData = await getSdtInflationData(publicClient[mainnet.id], 1)
  const gaugesWeights = await getGaugesWeights(process.env.PUBLIC_RPC_MAINNET as string)

  const curveData = await fetchCurve(
    prices,
    publicClient[mainnet.id],
    process.env.PUBLIC_RPC_MAINNET as string,
    process.env.ETHERSCAN_KEY as string,
    'etherscan.io',
    mainnet.id,
    19782781,
    sdtEmissionData as SdtEmissionData,
    gaugesWeights
  )

  fs.writeFile(
    `api/strategies/curve.json`,
    JSON.stringify(
      curveData,
      null,
      2,
    ),
    (err) => {
      if (err) {
        console.info(` 🟥 - An error occured on Curve strategies update.`)
        throw err
      } 
      console.info(` ✅ - Curve strategies have been updated!`)
    },
  )
}

main()
