import fs from 'fs'
import path from 'path'
import { createPublicClient, http, parseAbi } from 'viem'
import { arbitrum, base, mainnet, optimism, polygon } from 'viem/chains'
import { RPC } from '../../src/lib/constants'
import { chunk, readFile } from '../utils'

// Votemarket v2 platforms store a forwarder -> recipient mapping
// (`recipients(address)`) but emit no event when it is set, so the UI cannot
// discover which forwarders point at a connected recipient. This script
// enumerates the voters from the published weekly data
// (api/votemarket/{epoch}/{protocol}/index.json), multicalls
// `recipients(voter)` on every platform/chain found there, and writes the
// inverted mapping to api/votemarket/recipients.json.

const VM_DIR = 'api/votemarket'
const OUTPUT_PATH = `${VM_DIR}/recipients.json`
const EPOCH_LOOKBACK = 4
const MULTICALL_CHUNK = 500
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const RECIPIENTS_ABI = parseAbi(['function recipients(address) view returns (address)'])
const CHAINS = {
  [mainnet.id]: mainnet,
  [optimism.id]: optimism,
  [polygon.id]: polygon,
  [base.id]: base,
  [arbitrum.id]: arbitrum,
}

interface ForwardEntry {
  forwarder: string
  protocol: string
  chainId: number
  platform: string
}

const listDirs = (dir: string) =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
    : []

// Latest index.json per protocol across the last EPOCH_LOOKBACK published epochs
const getProtocolIndexes = () => {
  const epochs = listDirs(VM_DIR)
    .filter((name) => /^\d+$/.test(name))
    .map(Number)
    .sort((a, b) => b - a)
    .slice(0, EPOCH_LOOKBACK)

  const indexes: Record<string, { epoch: number; data: any }> = {}
  for (const epoch of epochs) {
    for (const protocol of listDirs(path.join(VM_DIR, `${epoch}`))) {
      if (indexes[protocol]) continue
      const indexPath = path.join(VM_DIR, `${epoch}`, protocol, 'index.json')
      if (fs.existsSync(indexPath)) indexes[protocol] = { epoch, data: readFile({ path: indexPath }) }
    }
  }
  return indexes
}

// {`${chainId}-${platform_lc}`: Set<voter_lc>} from an index.json
const collectVoters = (indexData: any) => {
  const voters: Record<string, Set<string>> = {}
  for (const [platform, chains] of Object.entries(indexData.platforms ?? {})) {
    for (const [chainId, chainData] of Object.entries(chains as Record<string, any>)) {
      const key = `${chainId}-${platform.toLowerCase()}`
      if (!voters[key]) voters[key] = new Set()
      for (const gauge of Object.values((chainData.gauges ?? {}) as Record<string, any>)) {
        for (const user of Object.keys(gauge.users ?? {})) voters[key].add(user.toLowerCase())
        for (const listed of Object.values((gauge.listed_users ?? {}) as Record<string, any>)) {
          for (const user of Object.keys(listed)) voters[key].add(user.toLowerCase())
        }
      }
    }
  }
  return voters
}

// {forwarder_lc: recipient_lc} for voters with a recipient set on the platform
const fetchPlatformRecipients = async (chainId: number, platform: string, voters: string[]) => {
  const chain = CHAINS[chainId]
  if (!chain || !RPC[chainId]) {
    console.warn(`No chain/RPC configured for chain ${chainId}, skipping ${platform}`)
    return {}
  }
  const client = createPublicClient({ chain, transport: http(RPC[chainId]) })

  const found: Record<string, string> = {}
  for (const votersChunk of chunk(voters.sort(), MULTICALL_CHUNK)) {
    const results = await client.multicall({
      contracts: votersChunk.map((voter: string) => ({
        address: platform as `0x${string}`,
        abi: RECIPIENTS_ABI,
        functionName: 'recipients',
        args: [voter as `0x${string}`],
      })),
    })
    votersChunk.forEach((voter: string, i: number) => {
      const r = results[i]
      if (r.status !== 'success') return
      const recipient = (r.result as string).toLowerCase()
      if (recipient !== ZERO_ADDRESS && recipient !== voter) found[voter] = recipient
    })
  }
  return found
}

const updateVotemarketRecipients = async () => {
  const indexes = getProtocolIndexes()
  const epochs: Record<string, number> = {}
  const recipients: Record<string, ForwardEntry[]> = {}

  for (const [protocol, { epoch, data }] of Object.entries(indexes)) {
    epochs[protocol] = epoch
    for (const [key, voters] of Object.entries(collectVoters(data))) {
      if (voters.size === 0) continue
      const [chainIdStr, platform] = key.split('-')
      const chainId = Number(chainIdStr)
      const forwards = await fetchPlatformRecipients(chainId, platform, [...voters])
      for (const [forwarder, recipient] of Object.entries(forwards)) {
        if (!recipients[recipient]) recipients[recipient] = []
        recipients[recipient].push({ forwarder, protocol, chainId, platform })
      }
      console.info(
        `${protocol} ${platform} chain ${chainId}: ${voters.size} voters, ${Object.keys(forwards).length} forwarding`,
      )
    }
  }

  for (const entries of Object.values(recipients)) {
    entries.sort((a, b) =>
      `${a.protocol}-${a.chainId}-${a.platform}-${a.forwarder}`.localeCompare(
        `${b.protocol}-${b.chainId}-${b.platform}-${b.forwarder}`,
      ),
    )
  }
  const payload = {
    epochs,
    recipients: Object.fromEntries(Object.entries(recipients).sort(([a], [b]) => a.localeCompare(b))),
  }

  if (fs.existsSync(OUTPUT_PATH)) {
    const existing = readFile({ path: OUTPUT_PATH })
    if (JSON.stringify(existing.recipients) === JSON.stringify(payload.recipients)) {
      console.info('Recipients map unchanged, skipping write.')
      return
    }
  }
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2))
  console.info(`Wrote ${OUTPUT_PATH}: ${Object.keys(payload.recipients).length} recipients`)
}

updateVotemarketRecipients()
