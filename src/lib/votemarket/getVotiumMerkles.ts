import memoize from 'memoizee'
import { MEMO_MAX_AGE } from '../utils'
import tokens from '../../../api/tokens/index.json'
import * as fs from 'fs'
import * as path from 'path'
import { ParquetReader } from 'parquetjs'
import { pipeline } from 'stream'
import { promisify } from 'util'
import { createPublicClient, http, parseAbi } from 'viem'
import { mainnet } from 'viem/chains'
import { RPC } from '../constants'

const API_URL = 'https://api.github.com/repos/oo-00/Votium'
const MERKLE_API_BASE = 'https://raw.githubusercontent.com/oo-00/Votium/refs/heads/main/merkle/'
const PARQUET_DELEGATORS_API =
  'https://raw.githubusercontent.com/stake-dao/bounties-report/main/data/delegations/1/0x52ea58f4FC3CEd48fa18E909226c1f8A0EF887DC.parquet'
const VOTIUM_MERKLE = '0x378Ba9B73309bE80BF4C2c027aAD799766a7ED5A'

async function getSubdirectories(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Erreur : ${response.status} ${response.statusText}`)
    const data = await response.json()

    return data.filter((item) => item.type === 'dir').map((item) => item.name)
  } catch (error) {
    console.error(error)
    return []
  }
}

function formatBytes32String(text: string): string {
  const utf8Bytes = new TextEncoder().encode(text)

  const padded = new Uint8Array(32)
  padded.set(utf8Bytes)

  return (
    '0x' +
    Array.from(padded)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  )
}

const streamPipeline = promisify(pipeline)

async function getDelegators() {
  const spaceId = formatBytes32String('cvx.eth')
  console.log(spaceId)
  let delegators: any[] = []
  try {
    const response = await fetch(PARQUET_DELEGATORS_API)
    if (!response.ok) throw new Error(`Erreur : ${response.status} ${response.statusText}`)
    const tempFilePath = path.join(__dirname, 'temp.parquet')
    const fileStream = fs.createWriteStream(tempFilePath)
    await streamPipeline(response.body as any, fileStream)

    // Lire le fichier Parquet
    const reader = await ParquetReader.openFile(tempFilePath)
    const cursor = reader.getCursor()
    let record: any

    while ((record = await cursor.next())) {
      if (record.spaceId !== spaceId) continue
      if (record.event === 'Set' && !delegators.includes(record.user)) {
        delegators.push(record.user)
      }
      if (record.event === 'Clear' && delegators.includes(record.user)) {
        delegators = delegators.filter((d) => d !== record.user)
      }
    }

    await reader.close()
    fs.unlinkSync(tempFilePath)
  } catch (error) {
    console.error(error)
    return []
  }

  console.log(`Found ${delegators.length} delegators for space 'cvx.eth'`)
  return delegators
}

function findToken(symbol: string) {
  return tokens.find((t) => t.symbol.toLowerCase() === symbol.toLowerCase() && t.chainId === 1)
}

function getTokenMerkle(symbol: string) {
  return `${MERKLE_API_BASE}/${symbol}/${symbol}.json`
}

async function fetchIfToOld(symbol: string) {
  try {
    const response = await fetch(`${API_URL}/commits?path=merkle/${symbol}/${symbol}.json`)
    if (!response.ok) throw new Error(`Erreur : ${response.status} ${response.statusText}`)

    const commits = await response.json()
    if (commits.length === 0) {
      console.log('No commit found.')
      return true
    }

    const lastUpdate = new Date(commits[0].commit.committer.date)
    const limit = new Date()
    limit.setMonth(limit.getMonth() - 2)

    if (lastUpdate > limit) {
      console.log(`✅ File for token "${symbol}" has been updated recently (${lastUpdate.toISOString()}).`)
      return false
    } else {
      console.log(`❌ File for token "${symbol}" has not been updated recently (${lastUpdate.toISOString()}).`)
      return true
    }
  } catch (error) {
    console.error('Error :', error)
    return false
  }
}

const processVotiumMerkles = async (provider: any) => {
  const output = { claims: {} }

  // Fetch delegators from your parquet file.
  let delegators = await getDelegators()

  // Query the forwarding contract for each delegator.
  const forwardedAddresses: string[] = await provider.readContract({
    address: '0x92e6E43f99809dF84ed2D533e1FD8017eb966ee2',
    abi: parseAbi(['function batchAddressCheck(address[]) view returns (address[])']),
    functionName: 'batchAddressCheck',
    args: [delegators],
  })

  // Replace each delegator with its forwarded address (if set), or keep the original.
  // Log the replacement for each delegator.
  delegators = delegators.map((delegator, i) => {
    const original = delegator.toLowerCase()
    const forwarded = forwardedAddresses[i]
    if (forwarded && forwarded !== '0x0000000000000000000000000000000000000000') {
      console.log(`Delegator ${original} forwarded to ${forwarded.toLowerCase()}`)
      return forwarded.toLowerCase()
    } else {
      console.log(`Delegator ${original} has no forwarded address`)
      return original
    }
  })

  console.log(`Found ${delegators.length} effective delegator addresses after forwarding check.`)

  // Get subdirectories for tokens (as before).
  const subdirectories = await getSubdirectories(`${API_URL}/contents/merkle`)
  for (const symbol of subdirectories) {
    const token = findToken(symbol)
    if (!token) continue

    const merkle = await fetch(getTokenMerkle(symbol)).then((res) => res.json())

    // Iterate over the merkle claims.
    for (const user of Object.keys(merkle.claims)) {
      // Process only if the merkle claim's key is one of our effective delegators.
      if (!delegators.includes(user.toLowerCase())) continue

      if (!output.claims[user.toLowerCase()]) {
        output.claims[user.toLowerCase()] = { tokens: {} }
      }
      output.claims[user.toLowerCase()].tokens[token.address] = {
        index: merkle.claims[user].index,
        amount: merkle.claims[user].amount,
        proof: merkle.claims[user].proof,
      }
    }
  }

  // Check claimed statuses with multicall.
  const claimsToCheck = Object.keys(output.claims).flatMap((u) =>
    Object.keys(output.claims[u].tokens).flatMap((t) => ({
      token: t,
      index: output.claims[u].tokens[t].index,
      user: u,
    })),
  )
  const checkClaimed = await provider.multicall({
    contracts: claimsToCheck.map((c) => ({
      address: VOTIUM_MERKLE,
      abi: parseAbi(['function isClaimed(address,uint256) external returns(bool)']),
      functionName: 'isClaimed',
      args: [c.token, c.index],
    })),
  })

  for (const [index, check] of claimsToCheck.entries()) {
    if (checkClaimed[index].result) {
      delete output.claims[check.user].tokens[check.token]
    }
  }

  // Remove delegators with no claimable tokens.
  for (const user of Object.keys(output.claims)) {
    if (Object.keys(output.claims[user].tokens).length === 0) {
      delete output.claims[user]
    }
  }

  console.log('Delegators with claimable on votium:', Object.keys(output.claims).length)
  return output
}

export const getVotiumMerkles = memoize(
  async () => {
    const provider = createPublicClient({
      chain: mainnet,
      transport: http(RPC[mainnet.id]),
    })

    return await processVotiumMerkles(provider)
  },
  { maxAge: MEMO_MAX_AGE },
)
