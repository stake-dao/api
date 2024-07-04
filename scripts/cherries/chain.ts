import { createPublicClient, http, erc20Abi, type Address } from 'viem'
import { bsc } from 'viem/chains'
import { getToken0Amount } from './pancakeswapMath'
import {
  NEW_POOL_LP_ADDRESS,
  OLD_POOL_LP_ADDRESS,
  PANCAKE_POOL_V3_ADDRESS,
  PANCAKE_POSITION_MANAGER,
} from './constants'

export const bscPublicClient = createPublicClient({
  chain: bsc,
  transport: http(),
})

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
  console.log(address, user, block)
  const balanceOf = await bscPublicClient.readContract({
    address: address as Address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [user as Address],
    blockNumber: BigInt(block),
  })

  return balanceOf
}

export const getBalanceOfOldLp = async (user: string, block: number): Promise<bigint> => {
  return await getBalanceOf(OLD_POOL_LP_ADDRESS, user, block)
}

export const getBalanceOfNewLp = async (user: string, block: number): Promise<bigint> => {
  return await getBalanceOf(NEW_POOL_LP_ADDRESS, user, block)
}

export const getBalanceOfGauge = async (gaugeAddress: string, user: string, block: number): Promise<bigint> => {
  return await getBalanceOf(gaugeAddress, user, block)
}

export const getCakeAmountInPosition = async (tokenId: number, block: number): Promise<bigint> => {
  const position = await bscPublicClient.readContract({
    address: PANCAKE_POSITION_MANAGER,
    abi: [
      {
        inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
        name: 'positions',
        outputs: [
          { internalType: 'uint96', name: 'nonce', type: 'uint96' },
          { internalType: 'address', name: 'operator', type: 'address' },
          { internalType: 'address', name: 'token0', type: 'address' },
          { internalType: 'address', name: 'token1', type: 'address' },
          { internalType: 'uint24', name: 'fee', type: 'uint24' },
          { internalType: 'int24', name: 'tickLower', type: 'int24' },
          { internalType: 'int24', name: 'tickUpper', type: 'int24' },
          { internalType: 'uint128', name: 'liquidity', type: 'uint128' },
          {
            internalType: 'uint256',
            name: 'feeGrowthInside0LastX128',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'feeGrowthInside1LastX128',
            type: 'uint256',
          },
          { internalType: 'uint128', name: 'tokensOwed0', type: 'uint128' },
          { internalType: 'uint128', name: 'tokensOwed1', type: 'uint128' },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'positions',
    args: [BigInt(tokenId)],
    blockNumber: BigInt(block),
  })

  const slot0 = await bscPublicClient.readContract({
    address: PANCAKE_POOL_V3_ADDRESS,
    abi: [
      {
        inputs: [],
        name: 'slot0',
        outputs: [
          { internalType: 'uint160', name: 'sqrtPriceX96', type: 'uint160' },
          { internalType: 'int24', name: 'tick', type: 'int24' },
          {
            internalType: 'uint16',
            name: 'observationIndex',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'observationCardinality',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'observationCardinalityNext',
            type: 'uint16',
          },
          { internalType: 'uint32', name: 'feeProtocol', type: 'uint32' },
          { internalType: 'bool', name: 'unlocked', type: 'bool' },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'slot0',
    blockNumber: BigInt(block),
  })

  const token0Amount = getToken0Amount(
    slot0[1], // tick
    position[5], // tick lower
    position[6], // tick upper
    slot0[0], // sqrtPriceX96
    position[7], // liquidity
  )

  return token0Amount
}
