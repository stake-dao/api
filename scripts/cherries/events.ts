import dotenv from 'dotenv'
import { formatUnits, decodeEventLog, parseAbi, hexToNumber, zeroAddress } from 'viem'

import {
  ADD_LP_TOPIC,
  DECREASE_LP_TOPIC,
  INCREASE_LP_TOPIC,
  NEW_POOL_ADDRESS,
  PANCAKE_POOL_V3_ADDRESS,
  PANCAKE_POSITION_MANAGER,
  REMOVE_LP_TOPIC,
  REWARDS_MERKL,
  SDCAKE_ADDRESS_V2,
  SDCAKE_GAUGE_ADDRESS,
  SDCAKE_GAUGE_ADDRESS_V2,
} from './constants'
import { bscPublicClient } from './chain'

dotenv.config()

const EXPLORER_DOMAIN = 'bscscan.com'
const API_KEY = process.env.BSCSCAN_TOKEN

interface FetchEventsFromExplorerArgs {
  contract: string
  fromBlock: number
  toBlock: number
  topic: string
}

const equalTlc = (str1: string, str2: string) => {
  return str1.toLowerCase() === str2.toLowerCase()
}

const fetchEventsFromExplorer = async (args: FetchEventsFromExplorerArgs) => {
  const { contract, fromBlock, toBlock, topic } = args

  const request = await fetch(
    `https://api.${EXPLORER_DOMAIN}/api?module=logs&action=getLogs&address=${
      contract
    }&fromBlock=${fromBlock}&toBlock=${toBlock}&topic0=${topic}&apikey=${API_KEY}`,
  )
  return await request.json()
}

export const getDepositorV2Events = async (fromBlock: number, toBlock: number) => {
  const depositorV2Events = await fetchEventsFromExplorer({
    contract: '0x32ee46755AE81ce917392ed1fB21f74a8104515B',
    fromBlock,
    toBlock,
    topic: '0x1652dc46c7c8f691f8e51f9897515fc24cbd8cafd7eb97f620fe1635399d8c76', // Deposited
  })

  const depositorV2Mint = depositorV2Events.result.map((event) => {
    const decodedEvent = decodeEventLog({
      abi: parseAbi([
        'event Deposited(address indexed caller, address indexed user, uint256 amount, bool lock, bool stake)',
      ]),
      data: event.data,
      topics: event.topics,
    })

    return {
      user: decodedEvent.args.user,
      amount: formatUnits(decodedEvent.args.amount, 0),
      tx: event.transactionHash,
      timestamp: hexToNumber(event.timeStamp),
      blockNumber: hexToNumber(event.blockNumber),
    }
  })

  return depositorV2Mint
}

export const getPoolV3Events = async (fromBlock: number, toBlock: number) => {
  const v3PoolEvents = await fetchEventsFromExplorer({
    contract: PANCAKE_POOL_V3_ADDRESS,
    fromBlock,
    toBlock,
    topic: '0x7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde',
  })

  const v3PoolMint: any[] = []
  for (const event of v3PoolEvents.result) {
    const tx = event.transactionHash
    const txReceipt = await bscPublicClient.getTransactionReceipt({ hash: tx })

    const increaseLiquidityEvent = txReceipt.logs.find(
      (log) =>
        log.address.toLowerCase() === PANCAKE_POSITION_MANAGER.toLowerCase() &&
        log.topics[0]?.toLowerCase() === '0x3067048beee31b25b2f1681f88dac838c8bba36af25bfb2b7cf7473a5847e35f', // IncreaseLiquidity
    )
    const decodedIncreaseLiquidityEvent = decodeEventLog({
      abi: parseAbi([
        'event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)',
      ]),
      data: increaseLiquidityEvent!.data,
      topics: increaseLiquidityEvent!.topics,
    })

    v3PoolMint.push({
      user: txReceipt.from,
      tokenId: Number(decodedIncreaseLiquidityEvent.args.tokenId),
      tx,
      timestamp: hexToNumber(event.timeStamp),
      blockNumber: hexToNumber(event.blockNumber),
    })
  }

  return v3PoolMint
}

export const getPoolEvents = async (fromBlock: number, toBlock: number) => {
  const poolEvents = await fetchEventsFromExplorer({
    contract: NEW_POOL_ADDRESS,
    fromBlock,
    toBlock,
    topic: '0x26f55a85081d24974e85c6c00045d0f0453991e95873f52bff0d21af4079a768', // AddLiquidity
  })

  const poolMint: any[] = []
  for (const event of poolEvents.result) {
    const decodedEvent = decodeEventLog({
      abi: parseAbi([
        'event AddLiquidity(address indexed provider, uint256[2] token_amounts, uint256[2] fees, uint256 invariant, uint256 token_supply)',
      ]),
      data: event.data,
      topics: event.topics,
    })

    poolMint.push({
      user: decodedEvent.args.provider,
      tx: event.transactionHash,
      timestamp: hexToNumber(event.timeStamp),
      blockNumber: hexToNumber(event.blockNumber),
    })
  }

  return poolMint
}

export const getBuyEvents = async (fromBlock: number, toBlock: number) => {
  const sdCakeEvents = await fetchEventsFromExplorer({
    contract: SDCAKE_ADDRESS_V2,
    fromBlock,
    toBlock,
    topic: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer
  })

  const sdCakeTransfer: any[] = []
  for (const event of sdCakeEvents.result) {
    const tx = event.transactionHash

    const decodedEvent = decodeEventLog({
      abi: parseAbi(['event Transfer(address indexed from, address indexed to, uint256 amount)']),
      data: event.data,
      topics: event.topics,
    })

    const from = decodedEvent.args.from
    const to = decodedEvent.args.to

    if (
      !equalTlc(from, zeroAddress) &&
      !equalTlc(from, SDCAKE_GAUGE_ADDRESS) &&
      !equalTlc(from, SDCAKE_GAUGE_ADDRESS_V2) &&
      !equalTlc(from, REWARDS_MERKL) &&
      !equalTlc(to, SDCAKE_GAUGE_ADDRESS) &&
      !equalTlc(to, SDCAKE_GAUGE_ADDRESS_V2)
    ) {
      const txReceipt = await bscPublicClient.getTransactionReceipt({ hash: tx })

      const user = txReceipt.from
      let type = 'NEUTRAL'

      if (from.toLowerCase() === user.toLowerCase()) type = 'SELL'
      if (to.toLowerCase() === user.toLowerCase()) type = 'BUY'
      if (txReceipt.logs.find((l) => l.topics.find((topic) => equalTlc(topic, ADD_LP_TOPIC)))) type = 'ADD_LIQUIDITY'
      if (txReceipt.logs.find((l) => l.topics.find((topic) => equalTlc(topic, REMOVE_LP_TOPIC))))
        type = 'REMOVE_LIQUIDITY'
      if (txReceipt.logs.find((l) => l.topics.find((topic) => equalTlc(topic, INCREASE_LP_TOPIC))))
        type = 'ADD_LIQUIDITY_V3'
      if (txReceipt.logs.find((l) => l.topics.find((topic) => equalTlc(topic, DECREASE_LP_TOPIC))))
        type = 'ADD_LIQUIDITY_V3'

      sdCakeTransfer.push({
        user: txReceipt.from,
        type,
        from,
        to,
        amount: formatUnits(decodedEvent.args.amount, 0),
        tx,
        timestamp: hexToNumber(event.timeStamp),
        blockNumber: hexToNumber(event.blockNumber),
      })
    }
  }

  return sdCakeTransfer.filter((transfer) => transfer.type === 'BUY')
}
