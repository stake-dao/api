import { createPublicClient, http, erc20Abi, type Address } from 'viem'
import { bsc } from 'viem/chains'
import { getToken0Amount } from './pancakeswapMath'
import {
  NEW_LP_TIMESTAMP,
  NEW_POOL_LP_ADDRESS,
  OLD_POOL_LP_ADDRESS,
  PANCAKE_POOL_V3_ADDRESS,
  PANCAKE_POSITION_MANAGER,
  POOL_CREATION_BLOCK,
  POOL_V3_TIMESTAMP,
  POSITION_ABI,
  SDCAKE_ADDRESS,
  SDCAKE_ADDRESS_V2,
  SDCAKE_GAUGE_ADDRESS,
  SDCAKE_GAUGE_ADDRESS_V2,
  SLOT0_ABI,
  V2_TIMESTAMP,
  Zero,
} from './constants'
import { User } from './classes'

export const bscPublicClient = createPublicClient({
  chain: bsc,
  transport: http(),
})

export interface ComputeRateRes {
  sdTotalSupply: bigint
  slot0: any
  balanceOfLp: bigint
  balanceOfGauge: bigint
  positions: any[]
}

const userCalls = (user: string, positions: number[], timestamp: number) => [
  // pool balance
  {
    address: (timestamp >= NEW_LP_TIMESTAMP ? NEW_POOL_LP_ADDRESS : OLD_POOL_LP_ADDRESS) as Address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [user as Address],
  },
  // gauge balance
  {
    address: (timestamp >= V2_TIMESTAMP ? SDCAKE_GAUGE_ADDRESS_V2 : SDCAKE_GAUGE_ADDRESS) as Address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [user as Address],
  },
  // positions
  ...positions.map((tokenId) => ({
    address: PANCAKE_POSITION_MANAGER as Address,
    abi: POSITION_ABI as any,
    functionName: 'positions',
    args: [BigInt(tokenId)],
  })),
]

export const multicall = async (users: User[], block: number, timestamp: number) => {
  const results = await bscPublicClient.multicall({
    contracts: [
      // sdcake total supply
      {
        address: (timestamp >= V2_TIMESTAMP ? SDCAKE_ADDRESS_V2 : SDCAKE_ADDRESS) as Address,
        abi: erc20Abi,
        functionName: 'totalSupply',
        args: [],
      },
      // v3 pool slot0
      {
        address: PANCAKE_POOL_V3_ADDRESS as Address,
        abi: SLOT0_ABI as any,
        functionName: 'slot0',
        args: [],
      },
      // user calls
      ...users.flatMap((u) => userCalls(u.address, u.positions, timestamp)),
    ],
    blockNumber: BigInt(block),
  })

  return results
}

export const computeRateMulticall = async (
  user: string,
  positions: number[],
  block: number,
  timestamp: number,
): Promise<ComputeRateRes> => {
  const [rawSdTotalSupply, rawSlot0, rawBalanceOfLp, rawBalanceOfGauge, ...rawPositions] =
    await bscPublicClient.multicall({
      contracts: [
        // sdcake total supply
        {
          address: (timestamp >= V2_TIMESTAMP ? SDCAKE_ADDRESS_V2 : SDCAKE_ADDRESS) as Address,
          abi: erc20Abi,
          functionName: 'totalSupply',
          args: [],
        },
        // v3 pool slot0
        {
          address: PANCAKE_POOL_V3_ADDRESS as Address,
          abi: SLOT0_ABI as any,
          functionName: 'slot0',
          args: [],
        },
        // user calls
        ...userCalls(user, positions, timestamp),
      ],
      blockNumber: BigInt(block),
    })

  return {
    sdTotalSupply: rawSdTotalSupply.result as bigint,
    slot0: timestamp >= POOL_V3_TIMESTAMP ? rawSlot0.result : undefined,
    balanceOfLp: (block > POOL_CREATION_BLOCK ? rawBalanceOfLp.result : Zero) as bigint,
    balanceOfGauge: rawBalanceOfGauge.result as bigint,
    positions: rawPositions.map((p) => p.result),
  }
}

export const getSdCakeTotalSupply = async (sdCakeAddress: string, block: number): Promise<bigint> => {
  const totalSupply = await bscPublicClient.readContract({
    address: sdCakeAddress as Address,
    abi: erc20Abi,
    functionName: 'totalSupply',
    blockNumber: BigInt(block),
  })

  return totalSupply
}

const getBalanceOf = async (address: string, user: string, block: number): Promise<bigint> => {
  const balanceOf = await bscPublicClient.readContract({
    address: address as Address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [user as Address],
    blockNumber: BigInt(block),
  })

  return balanceOf
}

export const getBalanceOfLp = async (
  user: string,
  block: number,
  timestamp: number,
  prefetchData?: bigint,
): Promise<bigint> => {
  if (block > POOL_CREATION_BLOCK) {
    if (typeof prefetchData === 'undefined') {
      const lpAddress = timestamp >= NEW_LP_TIMESTAMP ? NEW_POOL_LP_ADDRESS : OLD_POOL_LP_ADDRESS
      return await getBalanceOf(lpAddress, user, block)
    }

    return prefetchData
  }

  return Zero
}

export const getBalanceOfGauge = async (
  user: string,
  block: number,
  timestamp: number,
  prefetchData?: bigint,
): Promise<bigint> => {
  if (typeof prefetchData === 'undefined') {
    const gaugeAddress = timestamp >= V2_TIMESTAMP ? SDCAKE_GAUGE_ADDRESS_V2 : SDCAKE_GAUGE_ADDRESS
    return await getBalanceOf(gaugeAddress, user, block)
  }

  return prefetchData
}

export const getCakeAmountInPosition = async (
  tokenId: number,
  block: number,
  prefetchData?: { slot0; position },
): Promise<bigint> => {
  let position: any = prefetchData ? prefetchData.position : undefined
  let slot0: any = prefetchData ? prefetchData.slot0 : undefined

  if (typeof position === 'undefined') {
    position = (await bscPublicClient.readContract({
      address: PANCAKE_POSITION_MANAGER,
      abi: POSITION_ABI,
      functionName: 'positions',
      args: [BigInt(tokenId)],
      blockNumber: BigInt(block),
    })) as any
  }

  if (typeof slot0 === 'undefined') {
    slot0 = (await bscPublicClient.readContract({
      address: PANCAKE_POOL_V3_ADDRESS,
      abi: SLOT0_ABI,
      functionName: 'slot0',
      blockNumber: BigInt(block),
    })) as any
  }

  const token0Amount = getToken0Amount(
    slot0[1], // tick
    position[5], // tick lower
    position[6], // tick upper
    slot0[0], // sqrtPriceX96
    position[7], // liquidity
  )

  return token0Amount
}
