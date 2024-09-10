import {
  FIFTY_M,
  FIFTY_M_MULTIPLIER,
  GAUGE_RATE,
  ONE,
  POOL_V3_TIMESTAMP,
  SDCAKE_ADDRESS,
  SDCAKE_ADDRESS_V2,
  TEN_M,
  TEN_M_MULTIPLIER,
  THREE_M,
  THREE_M_MULTIPLIER,
  TWENTY_FIVE_M,
  TWENTY_FIVE_M_MULTIPLIER,
  V2_TIMESTAMP,
  Zero,
} from './constants'
import { Global } from './classes'
import {
  ComputeRateRes,
  computeRateMulticall,
  getBalanceOfGauge,
  getBalanceOfLp,
  getCakeAmountInPosition,
  getSdCakeTotalSupply,
} from './chain'

export async function computeRate(
  blockNumber: number,
  address: string,
  timestamp: number,
  positions: number[],
  prefetchData?: ComputeRateRes,
): Promise<bigint> {
  let rateData = prefetchData
  if (typeof rateData === 'undefined') {
    rateData = await computeRateMulticall(address, positions, blockNumber, timestamp)
  }

  const gaugeBalance = await getBalanceOfGauge(
    address,
    blockNumber,
    timestamp,
    rateData ? rateData.balanceOfGauge : undefined,
  )
  let poolBalance = await getBalanceOfLp(address, blockNumber, timestamp, rateData ? rateData.balanceOfLp : undefined)

  if (timestamp >= POOL_V3_TIMESTAMP) {
    for (let i = 0; i < positions.length; i++) {
      const v3PoolCakePosition = await getCakeAmountInPosition(
        positions[i],
        blockNumber,
        rateData ? { slot0: rateData.slot0, position: rateData.positions[i] } : undefined,
      )
      poolBalance = poolBalance + v3PoolCakePosition
    }
  }

  return ((gaugeBalance + poolBalance) * GAUGE_RATE) / ONE
}

export async function computePoints(
  blockNumber: number,
  amount: bigint,
  global: Global,
  timestamp: number,
): Promise<bigint> {
  let sdCakeAddress = SDCAKE_ADDRESS
  if (timestamp >= V2_TIMESTAMP) {
    sdCakeAddress = SDCAKE_ADDRESS_V2
  }

  const newSupply = await getSdCakeTotalSupply(sdCakeAddress, blockNumber)
  const supply = newSupply - amount

  if (supply < THREE_M) {
    if (newSupply >= THREE_M) {
      global.threeMTimestamp = timestamp
      global.currentMultiplier = Number(TEN_M_MULTIPLIER)
    }
    return amount * THREE_M_MULTIPLIER
  } else if (supply < TEN_M) {
    if (newSupply >= TEN_M) {
      global.tenMTimestamp = timestamp
      global.currentMultiplier = Number(TWENTY_FIVE_M_MULTIPLIER)
    }
    return amount * TEN_M_MULTIPLIER
  } else if (supply < TWENTY_FIVE_M) {
    if (newSupply >= TWENTY_FIVE_M) {
      global.twentyFiveMTimestamp = timestamp
      global.currentMultiplier = Number(FIFTY_M_MULTIPLIER)
    }
    return amount * TWENTY_FIVE_M_MULTIPLIER
  } else if (supply < FIFTY_M) {
    if (newSupply >= FIFTY_M) {
      global.fiftyMTimestamp = timestamp
      global.currentMultiplier = 1
    }
    return amount * FIFTY_M_MULTIPLIER
  } else {
    return amount
  }
}

export function computeRatePoints(
  rate: bigint,
  timestampStart: number,
  timestampEnd: number,
  global: Global,
  basePoints: bigint = Zero,
): bigint {
  if (global.fiftyMTimestamp > Zero && timestampStart >= global.fiftyMTimestamp) {
    return basePoints + rate * BigInt(timestampEnd - timestampStart)
  } else if (global.twentyFiveMTimestamp > Zero && timestampStart >= global.twentyFiveMTimestamp) {
    if (global.fiftyMTimestamp > Zero && timestampEnd >= global.fiftyMTimestamp) {
      const checkpointPoints =
        basePoints + FIFTY_M_MULTIPLIER * (rate * BigInt(global.fiftyMTimestamp - timestampStart))
      return computeRatePoints(rate, global.fiftyMTimestamp, timestampEnd, global, checkpointPoints)
    } else {
      return basePoints + FIFTY_M_MULTIPLIER * (rate * BigInt(timestampEnd - timestampStart))
    }
  } else if (global.tenMTimestamp > Zero && timestampStart >= global.tenMTimestamp) {
    if (global.twentyFiveMTimestamp > Zero && timestampEnd >= global.twentyFiveMTimestamp) {
      const checkpointPoints =
        basePoints + TWENTY_FIVE_M_MULTIPLIER * (rate * BigInt(global.twentyFiveMTimestamp - timestampStart))
      return computeRatePoints(rate, global.twentyFiveMTimestamp, timestampEnd, global, checkpointPoints)
    } else {
      return basePoints + TWENTY_FIVE_M_MULTIPLIER * (rate * BigInt(timestampEnd - timestampStart))
    }
  } else if (global.threeMTimestamp > Zero && timestampStart >= global.threeMTimestamp) {
    if (global.tenMTimestamp > Zero && timestampEnd >= global.tenMTimestamp) {
      const checkpointPoints = basePoints + TEN_M_MULTIPLIER * (rate * BigInt(global.tenMTimestamp - timestampStart))
      return computeRatePoints(rate, global.tenMTimestamp, timestampEnd, global, checkpointPoints)
    } else {
      return basePoints + TEN_M_MULTIPLIER * (rate * BigInt(timestampEnd - timestampStart))
    }
  } else if (timestampStart >= V2_TIMESTAMP) {
    if (global.threeMTimestamp > Zero && timestampEnd >= global.threeMTimestamp) {
      const checkpointPoints =
        basePoints + THREE_M_MULTIPLIER * (rate * BigInt(global.threeMTimestamp - timestampStart))
      return computeRatePoints(rate, global.threeMTimestamp, timestampEnd, global, checkpointPoints)
    } else {
      return basePoints + THREE_M_MULTIPLIER * (rate * BigInt(timestampEnd - timestampStart))
    }
  } else {
    if (timestampEnd >= V2_TIMESTAMP) {
      const checkpointPoints =
        basePoints + THREE_M_MULTIPLIER * BigInt(2) * (rate * BigInt(V2_TIMESTAMP - timestampStart))
      return computeRatePoints(rate, V2_TIMESTAMP, timestampEnd, global, checkpointPoints)
    } else {
      return basePoints + THREE_M_MULTIPLIER * BigInt(2) * (rate * BigInt(timestampEnd - timestampStart))
    }
  }
}
