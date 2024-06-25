import fs from 'fs'
import { tokens, curveStrats } from '@stake-dao/constants'
import { type SdtEmissionData, getPricesFromLlama, fetchCurve, getSdtInflationData, getGaugesWeights } from '@stake-dao/reader'
import { http, createPublicClient } from 'viem'
import { arbitrum, bsc, mainnet } from 'viem/chains'
require('dotenv').config()

const main = async () => {

  const publicClient = {
    [mainnet.id]: createPublicClient({
      chain: mainnet,
      transport: http(process.env.PUBLIC_RPC_MAINNET),
    }),
    [arbitrum.id]: createPublicClient({
      chain: arbitrum,
      transport: http(process.env.PUBLIC_RPC_ARBITRUM)
    }),
    [bsc.id]: createPublicClient({
      chain: bsc,
      transport: http(),
    }),
  };

  const prices = await getPricesFromLlama(tokens.filter((t) => t.chainId === 1))
  const sdtEmissionData = await getSdtInflationData(publicClient[mainnet.id], 1)
  const gaugesWeights = await getGaugesWeights(process.env.PUBLIC_RPC_MAINNET as string)

  const [curveDataMainnet, curveDataArbitrum] = await Promise.all([
    fetchCurve(
    prices,
    publicClient[mainnet.id],
    process.env.PUBLIC_RPC_MAINNET as string,
    process.env.ETHERSCAN_TOKEN as string,
    'etherscan.io',
    mainnet.id,
    curveStrats.meta.lastSyncBlock[mainnet.id],
    sdtEmissionData as SdtEmissionData,
    gaugesWeights
  ),
  fetchCurve(
    prices,
    publicClient[arbitrum.id],
    process.env.PUBLIC_RPC_ARBITRUM as string,
    process.env.ARBISCAN_TOKEN as string,
    'arbiscan.io',
    arbitrum.id,
    curveStrats.meta.lastSyncBlock[arbitrum.id],
    sdtEmissionData as SdtEmissionData,
    gaugesWeights
  )
])

  // Write curve files
  fs.writeFile(
    `api/strategies/curve/${mainnet.id}.json`,
    JSON.stringify(curveDataMainnet, null, 2),
    (err) => {
      if (err) {
        console.info(` ❌ - An error occured on Curve mainnet strategies update.`)
        throw err
      } 
      console.info(` ✅ - Curve mainnet strategies have been updated!`)
    },
  )
  fs.writeFile(
    `api/strategies/curve/${arbitrum.id}.json`,
    JSON.stringify(curveDataArbitrum, null, 2),
    (err) => {
      if (err) {
        console.info(` ❌ - An error occured on Curve arbitrum strategies update.`)
        throw err
      } 
      console.info(` ✅ - Curve arbitrum strategies have been updated!`)
    },
  )
  fs.writeFile(
    `api/strategies/curve/index.json`,
    JSON.stringify({
      ...curveDataMainnet,
      deployed: [...curveDataMainnet.deployed, ...curveDataArbitrum.deployed],
      notDeployed: [...curveDataMainnet.notDeployed, ...curveDataArbitrum.notDeployed]
    }, null, 2),
    (err) => {
      if (err) {
        console.info(` ❌ - An error occured on Curve strategies update.`)
        throw err
      } 
      console.info(` ✅ - Curve strategies have been updated!`)
    },
  )
}

main()
