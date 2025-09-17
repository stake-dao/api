import { chunk, readFile, sleep, writeFile } from './utils'
import { ethBlockNumber, getEtherscanEvents } from '../src/lib/utils'
import { arbitrum, base, mainnet, optimism, polygon } from 'viem/chains'
import { decodeEventLog, parseAbi } from 'viem'
import { RPC } from '../src/lib/constants'

const FILE_PATH = 'api/recipients/index.json'

const TOPIC = '0xc1416b5cdab50a9fbc872236e1aa54566c6deb40024e63a4b1737ecacf09d6f9'

const MERKLES = {
  [mainnet.id]: ['0x000000006feeE0b7a0564Cd5CeB283e10347C4Db', '0x17F513CDE031C8B1E878Bde1Cb020cE29f77f380'],
  [optimism.id]: ['0x000000006feeE0b7a0564Cd5CeB283e10347C4Db'],
  [polygon.id]: ['0x000000006feeE0b7a0564Cd5CeB283e10347C4Db'],
  [base.id]: ['0x000000006feeE0b7a0564Cd5CeB283e10347C4Db', '0x665d334388012d17F1d197dE72b7b708ffCCB67d'],
  [arbitrum.id]: ['0x000000006feeE0b7a0564Cd5CeB283e10347C4Db'],
}

const updateMerklesRecipients = async () => {
  let parsedData = readFile({ path: FILE_PATH })
  const chainIds = Object.keys(MERKLES)

  // Get last block for each chains
  const blockNumbersPromise = await Promise.all(chainIds.map((chainId) => ethBlockNumber(RPC[chainId])))
  const blockNumbers = {}
  chainIds.forEach((chainId, index) => {
    blockNumbers[chainId] = Number(blockNumbersPromise[index].result)
  })

  const queriesParams = chainIds.flatMap((chainId) =>
    MERKLES[chainId].map((merkleAddress) => ({
      chainId,
      address: merkleAddress,
      fromBlock: parsedData.meta.lastBlocks[chainId],
      toBlock: blockNumbers[chainId],
      topic: TOPIC,
    })),
  )

  // 5 calls / seconds API rate limit
  const chunkedQueriesParams = chunk(queriesParams, 5)
  let promises: any = []

  for (const c of chunkedQueriesParams) {
    const promise = await Promise.all(c.map((queryParams) => getEtherscanEvents(queryParams)))
    promises = [...promises, ...promise]

    // 5 calls / seconds API rate limit
    if (c.length === 5) await sleep(1100)
  }

  queriesParams.forEach((qp, index) => {
    const events = promises[index]

    const decodedEvents = events?.result
      ? events.result.map((res) =>
          decodeEventLog({
            abi: parseAbi(['event RecipientSet(address indexed, address indexed)']),
            data: res.data,
            topics: res.topics,
          }),
        )
      : []

    if (typeof parsedData.data[qp.chainId] === 'undefined') parsedData.data[qp.chainId] = {}
    if (typeof parsedData.data[qp.chainId][qp.address] === 'undefined') parsedData.data[qp.chainId][qp.address] = {}

    decodedEvents.forEach((element) => {
      const account = element.args[0]
      const recipient = element.args[1]

      if (typeof parsedData.data[qp.chainId][qp.address][recipient] === 'undefined') {
        parsedData.data[qp.chainId][qp.address][recipient] = [account]
      } else parsedData.data[qp.chainId][qp.address][recipient].push(account)
    })
  })

  parsedData.meta.lastUpdate = Math.floor(Date.now() / 1000)
  parsedData.meta.lastBlocks = blockNumbers

  writeFile({
    path: FILE_PATH,
    data: JSON.stringify(parsedData),
    log: {
      success: '✅ - Recipients have been updated!',
      error: '❌ - An error occured during the Recipients update.',
    },
  })
}

updateMerklesRecipients()
