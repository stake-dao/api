import { parseUnits } from 'viem'

export const SDCAKE_GAUGE_ADDRESS = '0x0735f098C80Dd0cb39118b595d46CcD67b68672d'
export const SDCAKE_GAUGE_ADDRESS_V2 = '0xE2496134149e6CD3f3A577C2B08A6f54fC23e6e4'

export const SDCAKE_ADDRESS = '0xF79B275e0B602D82B822895074552e487412A41a'
export const SDCAKE_ADDRESS_V2 = '0x6a1c1447F97B27dA23dC52802F5f1435b5aC821A'

export const POOL_CREATION_BLOCK = 33883335
export const OLD_POOL_ADDRESS = '0xFC17919098E9f0A0d72093e25AD052a359AE3E43'
export const OLD_POOL_LP_ADDRESS = '0xb4C27884308C3Bca710c220D680BAb02f6b64b51'

export const NEW_POOL_ADDRESS = '0xb8204D31379A9B317CD61C833406C972F58ecCbC'
export const NEW_POOL_LP_ADDRESS = '0xB1D54d76E2cB9425Ec9c018538cc531440b55dbB'

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
export const DEPLOYER_ADDRESS = '0x000755Fbe4A24d7478bfcFC1E561AfCE82d1ff62'

export const Zero = BigInt(0)
export const ONE = parseUnits('1', 18)
export const GAUGE_RATE = parseUnits('0.0005', 18) / BigInt(3600)
export const MINT_BONUS = ONE
export const SELL_PENALTY = parseUnits('4', 18)

export const THREE_M = parseUnits('3000000', 18)
export const TEN_M = parseUnits('10000000', 18)
export const TWENTY_FIVE_M = parseUnits('25000000', 18)
export const FIFTY_M = parseUnits('50000000', 18)

export const V2_TIMESTAMP = 1701358200
export const NEW_LP_TIMESTAMP = 1702646636
export const POOL_V3_TIMESTAMP = 1703821901

export const THREE_M_MULTIPLIER = BigInt(10)
export const TEN_M_MULTIPLIER = BigInt(8)
export const TWENTY_FIVE_M_MULTIPLIER = BigInt(5)
export const FIFTY_M_MULTIPLIER = BigInt(3)

export const PANCAKE_POOL_V3_ADDRESS = '0x8A876Ca851063e0252654CA6368a5B2280f51c32'
export const PANCAKE_POSITION_MANAGER = '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364'
export const CAKE_ADDRESS = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82'

export const SLOT0_ABI = [
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
]

export const POSITION_ABI = [
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
]
