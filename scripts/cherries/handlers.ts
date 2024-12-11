import { formatUnits } from 'viem'
import { User, Global, getGlobal, getUser } from './classes'
import { computePoints, computeRate, computeRatePoints } from './computePoints'

interface HandleUpdateEventArgs {
  user: string | User
  timestamp: number
  blockNumber: number
}

export const handleUpdate = async (args: HandleUpdateEventArgs) => {
  const { user: address, timestamp, blockNumber } = args

  let user: User = typeof address === 'string' ? getUser({ address, timestamp }) : address
  let global: Global = getGlobal()

  // Compute amount of points from rate since last checkpoint add save them
  const ratePoints = computeRatePoints(BigInt(user.rate), user.timestamp, timestamp, global)
  user.points = formatUnits(BigInt(user.points) + ratePoints, 0)
  global.points = formatUnits(BigInt(global.points) + ratePoints, 0)

  // Compute new rate and save it
  const checkpointRate = await computeRate(blockNumber, user.address, timestamp, user.positions)
  global.rate = formatUnits(BigInt(global.rate) - BigInt(user.rate) + checkpointRate, 0)
  user.rate = formatUnits(checkpointRate, 0)

  // Save new timestamp
  global.timestamp = timestamp
  user.timestamp = timestamp

  return { user, global }
}

export interface HandleMintArgs {
  user: string
  amount: string
  tx: string
  timestamp: number
  blockNumber: number
  type: string
}

export const handleMint = async (args: HandleMintArgs) => {
  const { user: address, amount, timestamp, blockNumber } = args

  let user: User = getUser({ address, timestamp })
  let global: Global = getGlobal()

  const bonusPoints = (await computePoints(blockNumber, BigInt(amount), global, timestamp)) * BigInt(2)

  const ratePoints = computeRatePoints(BigInt(user.rate), user.timestamp, timestamp, global)
  user.points = formatUnits(BigInt(user.points) + bonusPoints + ratePoints, 0)
  global.points = formatUnits(BigInt(global.points) + bonusPoints + ratePoints, 0)

  // Compute new rate and save it
  const checkpointRate = await computeRate(blockNumber, user.address, timestamp, user.positions)
  global.rate = formatUnits(BigInt(global.rate) - BigInt(user.rate) + checkpointRate, 0)
  user.rate = formatUnits(checkpointRate, 0)

  // Save new timestamp
  global.timestamp = timestamp
  user.timestamp = timestamp

  return { user, global }
}

export interface HandleAddInV3PoolArgs {
  user: string
  tokenId: number
  tx: string
  timestamp: number
  blockNumber: number
}

export const handleAddInV3Pool = (args: HandleAddInV3PoolArgs) => {
  const { user: address, tokenId, timestamp, blockNumber } = args

  let user: User = getUser({ address, timestamp })
  user.positions = [...user.positions, tokenId]

  return handleUpdate({ user, timestamp, blockNumber })
}

export interface HandleAddInPoolArgs {
  user: string
  tokenId: number
  tx: string
  timestamp: number
  blockNumber: number
}

export const handleAddInPool = (args: HandleAddInPoolArgs) => {
  const { user: address, timestamp, blockNumber } = args
  let user: User = getUser({ address, timestamp })
  return handleUpdate({ user, timestamp, blockNumber })
}
