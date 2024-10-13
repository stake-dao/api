import fs from 'fs'
import path from 'path'

interface ProtocolData {
  epoch: number
  block_data: BlockData
  gauge_controller_proof: string
  platforms: {
    [address: string]: PlatformData
  }
}

export interface BlockData {
  block_number: number
  block_hash: string
  block_timestamp: number
  rlp_block_header: string
}

interface PlatformData {
  chain_id: number
  platform_address: string
  gauges: {
    [address: string]: GaugeData
  }
}

interface GaugeData {
  point_data_proof: string
  users: {
    [address: string]: UserData
  }
  listed_users: {
    [address: string]: ListedUsersData
  }
}

export interface UserData {
  storage_proof: string
  last_vote: number
  slope: number
  power: number
  end: number
}

interface ListedUsersData {
  storage_proof: string
}

const BASE_DIR = 'api/votemarket/'

////////////////////////////////////////////////////////////////
/// --- FULL DATA
///////////////////////////////////////////////////////////////
export async function getProtocolData(protocol: string, period: number): Promise<ProtocolData | null> {
  const filePath = path.join(BASE_DIR, period.toString(), protocol, 'main.json')

  return new Promise((resolve) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${filePath}: ${err}`)
        resolve(null)
        return
      }

      try {
        const jsonData: ProtocolData = JSON.parse(data)
        resolve(jsonData)
      } catch (error) {
        console.error(`Error parsing JSON from ${filePath}: ${error}`)
        resolve(null)
      }
    })
  })
}

////////////////////////////////////////////////////////////////
/// --- BLOCK DATA
///////////////////////////////////////////////////////////////
export async function getBlockData(protocol: string, period: number): Promise<BlockData | null> {
  const filePath = path.join(BASE_DIR, period.toString(), protocol, 'header.json')

  return new Promise((resolve) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${filePath}: ${err}`)
        resolve(null)
        return
      }

      try {
        const jsonData: BlockData = JSON.parse(data)
        resolve(jsonData)
      } catch (error) {
        console.error(`Error parsing JSON from ${filePath}: ${error}`)
        resolve(null)
      }
    })
  })
}

////////////////////////////////////////////////////////////////
/// --- GAUGE DATA
///////////////////////////////////////////////////////////////
export async function getGaugeData(protocol: string, period: number, chainId: string, platform: string, gaugeAddress: string): Promise<GaugeData | null> {
  const filePath = path.join(BASE_DIR, period.toString(), protocol, `${chainId}-${platform}`, `${gaugeAddress}.json`)

  return new Promise((resolve) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${filePath}: ${err}`)
        resolve(null)
        return
      }

      try {
        const jsonData: GaugeData = JSON.parse(data)
        resolve(jsonData)
      } catch (error) {
        console.error(`Error parsing JSON from ${filePath}: ${error}`)
        resolve(null)
      }
    })
  })
}

////////////////////////////////////////////////////////////////
/// --- USER DATA
///////////////////////////////////////////////////////////////
export function getUserData(gaugeData: GaugeData, userAddress: string): UserData | null {
  const lowerUserAddress = userAddress.toLowerCase()
  for (const [address, userData] of Object.entries(gaugeData.users)) {
    if (address.toLowerCase() === lowerUserAddress) {
      return userData
    }
  }
  return null
}

////////////////////////////////////////////////////////////////
/// --- LISTED USERS DATA
///////////////////////////////////////////////////////////////

export function getListedUsersData(gaugeData: GaugeData): { [address: string]: { storage_proof: string } } | null {
  if (gaugeData.listed_users) {
    return Object.entries(gaugeData.listed_users).reduce(
      (acc, [address, data]) => {
        acc[address.toLowerCase()] = { storage_proof: data.storage_proof }
        return acc
      },
      {} as { [address: string]: { storage_proof: string } }
    )
  }
  return null
}
