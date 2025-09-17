# Stake DAO API

This repository is meant to be used as API endpoints, with periodical updates through GitHub workflows

## Data

### Lockers data

Endpoint : [/api/lockers](https://api.stakedao.org/api/lockers)

Data type :

```
{
  parsed: {
    id: string;
    order: number;
    symbol: string;
    protocol: string;
    protocolDescription: string;
    website: string;
    logoUrl: string;
    chainId: number;
    rgb: string;
    token: {
      id: string;
      name: string;
      address: string;
      symbol: string;
      decimals: number;
      chainId: number;
      logoURI: string;
      tags: string[];
      extensions: {
        coingeckoSlug?: string;
        underlying?: string;
      };
      distribution?: string;
      origin?: string;
    };
    sdToken?: {
      id: string;
      name: string;
      address: string;
      symbol: string;
      decimals: number;
      chainId: number;
      logoURI: string;
      tags: string[];
      extensions: {
        underlying: string;
        coingeckoSlug?: string;
      };
    };
    rewards?: {
      token: {
        id: string;
        name: string;
        address: string;
        symbol: string;
        decimals: number;
        chainId: number;
        logoURI: string;
        tags: string[];
        extensions: {
          coingeckoSlug: string;
        };
        distribution: string;
        origin: string;
      };
      price: number;
      apr: number;
      streaming: boolean;
      periodFinish: number;
      rate: string;
      lastUpdate: string;
    }[];
    modules?: {
      depositor: string;
      locker: string;
      veToken: string;
      gauge: string;
      accumulator: string;
    };
    secondaryMarket?: {
      label: string;
      poolKey: string;
      pool: string;
      pegBase: number;
    };
    voteBooster?: {
      booster: string;
      vSdToken: string;
      balance: {
        token: string;
        sdToken: string;
        staked: string;
        working: string;
      };
      boost: number;
    };
    autoCompounder?: {
      aSdToken: string;
    };
    alternativeYields?: Record<string, {
      label: string;
      platform: string;
      href: string;
    }>;
    fees?: {
      label: {
        key: string;
        variable?: string;
      };
      value: number;
      key: string;
    }[];
    extensions?: {
      coingeckoBaseSlug?: string;
      strategyGauge?: string;
    };
    tokenLocked?: string;
    veBalanceOfLocker?: string;
    totalTokenLocked?: string;
    veTotalSupply?: string;
    lockIncentive?: string;
    incentiveAmountInToken?: string;
    gaugeWorkingSupply?: string;
    totalSupplyStaked?: string;
    amountTokenNotLock?: string;
    bribeRewards?: {
      bribeMinApr: number;
      bribeMaxApr: number;
      bribeAverageApr: number;
      minBoost: string;
      maxBoost: string;
      token: string;
    };
    apr: number[];
    streaming: boolean;
    veTokenRate: string;
    tvl: number;
    peg: string;
    tokenPriceInUsd: number;
    sdTokenPriceInUsd: number;
  }[];
  sdt: {
    lockersSdtPerBlock: string;
    lockersSdtPerSecond: string;
    stratsSdtPerBlock: string;
    stratsSdtPerSecond: string;
  };
  fetched: boolean;
};
```

### Strategies data

Strategies data are available on the endpoints `/api/strategies/{protocol}`

Available protocols : 

- [curve](https://api.stakedao.org/api/strategies/curve)
- [pendle](https://api.stakedao.org/api/strategies/pendle)
- [pancakeswap](https://api.stakedao.org/api/strategies/pancakeswap)
- [balancer](https://api.stakedao.org/api/strategies/balancer)
- [angle](https://api.stakedao.org/api/strategies/angle)

The chain id can be selected by adding {chainId}.json at the end of the endpoint.
e.g. Curve strategies on Ethereum can be fetched through the endpoint : [/api/strategies/curve/1.json](https://api.stakedao.org/api/strategies/curve/1.json)

```
export type Coin = {
  name: string
  symbol: string
  address: string
  decimals: number
}

export type AprDetail = {
  total: number
  details: {
    label: string
    value: number[]
  }[]
}

export type OnlyBoostAprDetail = {
  projected: {
    baseToken: number
  }
}

export type OnlyBoostProtocolData = {
  tvl: number
  supply: string
  boost: number
  optimal: {
    supply: string
    boost: number
    share: number
  }
  claimable?: {
    token: string
    claimable: string
  }[]
}

export type OnlyBoostData = {
  active: boolean
  implementations: {
    key: string
    address: string
  }[]
  totalSupply: string
  boost: number
  optimalBoost: number
  stakeDao: OnlyBoostProtocolData
  convex: OnlyBoostProtocolData
}

export type SdGauge = {
  address: string
  totalSupply: string
  relativeWeight: string
  weight: string
  futureWeight: string
  workingSupply: string
}

export type Fees = {
  veSdt: number
  perf: number
  accumulator: number
  claimer: number
}

export type VaultFees = {
  keeper: number
  accumulated: string
}

export type SdtApr = {
  sdtUserApr: number
  sdtFuturUserApr: number
  sdtMinApr: number
  sdtFuturMinApr: number
  sdtMaxApr: number
  sdtFuturMaxApr: number
  sdtBoost: number
}

export type RewardsData = {
  token: Coin
  price: number
  apr: number
  streaming: boolean
  periodFinish: number
  rate: string
  lastUpdate: string
  claimablePendingRewards: string
}

export type Strategy = {
  key: string
  type: string
  protocol: string
  chainId: number
  isMetapool?: boolean
  isLending?: boolean
  vault: string
  lpToken: Coin
  gaugeAddress: string
  gaugeToken?: Coin & { version: number }
  coins: Coin[]
  underlyingCoins?: Coin[]
  rewards: RewardsData[]
  name: string
  tradingApy: number
  underlyingApy?: number
  minApr: number
  maxApr: number
  lpPriceInUsd: number
  convexPool?: {
    id: number
    token: string
    gauge: string
    crvRewards: string
    stash: string
    shutdown: boolean
    usdTotal: number
  }
  tvl: number
  apr: {
    boost: number
    current: AprDetail
    projected: AprDetail
    onlyboost?: {
      convex: OnlyBoostAprDetail
      optimal: OnlyBoostAprDetail
    }
  }
  sdtApr?: SdtApr
  vaultHoldings: string
  totalSupply: string
  strategyHoldings: string
  workingBalance: string
  sdGauge: SdGauge
  vaultFees: VaultFees
  onlyboost?: OnlyBoostData | { active: boolean }
}

// GLOBAL DATA TYPE

export type CurveGlobalData = {
  totalGaugeWeights: string
  nextEffectiveTimestamp: string
  cvxTotalSupply: string
  veCrvTotalSupply: string
  stakeDaoVeBoost: string
  convexVeBoost: string
  fees: Fees
}

export type YearnGlobalData = {
  totalGaugeWeights: string
  fees: Fees
}

export type Global = CurveGlobalData | YearnGlobalData

export type StrategyData = {
  global?: Global
  deployed: Strategy[]
  notDeployed: any
  fetched: boolean
}

export type BuiltStrat = {
  key: string
  type: string
  protocol: string
  chainId: number
  isMetapool?: boolean
  isLending?: boolean
  vault: string
  lpToken: Coin
  gaugeAddress: string
  gaugeToken?: Coin & { version: number }
  coins: Coin[]
  underlyingCoins?: Coin[]
  sdGauge: string
  rewards: Coin[]
  underlyingReward?: Coin
}
```

### Pendle Holders data

Endpoint : [/api/strategies/pendle/holders](https://api.stakedao.org/api/strategies/pendle/holders)

Data type :

```
{
  "metadata": {
    "snapshot_date": string,  // ISO 8601 timestamp of data snapshot
    "pendle_locker": string,  // Pendle locker address
    "total_gauges": number,  // Total number of gauges
    "total_current_holders": number,  // Total current holders across all gauges
    "total_unique_users": number,  // Total unique users across all gauges
    "average_holding_duration_days": number,  // Average holding duration in days
    "gauges_summary": [  // Summary of all gauges
      {
        "gauge": string,  // Gauge address
        "symbol": string,  // PT token symbol
        "current_holders": number,  // Current number of holders
        "total_users": number,  // Total unique users (current + past)
        "current_supply": string  // Current total supply
      }
    ]
  },
  "gauges": [
    {
      "gauge_id": string,  // Gauge address
      "vault_id": string,  // Vault address (if available)
      "token": {
        "address": string,  // PT token address
        "symbol": string  // PT token symbol
      },
      "stats": {
        "total_deposited": string,  // Total amount ever deposited
        "total_withdrawn": string,  // Total amount ever withdrawn
        "current_supply": string,  // Current total supply
        "current_holders": number,  // Current number of holders
        "total_users": number  // Total unique users (current + past)
      },
      "current_holders": {  // Map of current holders
        "[user_address]": {
          "balance": string,  // Current balance
          "last_updated": number  // Unix timestamp of last update
        }
      },
      "user_histories": {  // Map of all user histories
        "[user_address]": {
          "first_seen": number,  // Unix timestamp when first seen
          "last_seen": number,  // Unix timestamp when last seen
          "entry_timestamp": number,  // Unix timestamp of first entry
          "exit_timestamp": number,  // Unix timestamp of exit (if applicable)
          "entry_block": number,  // Block number of first entry
          "exit_block": number,  // Block number of exit (if applicable)
          "max_balance": number,  // Maximum balance ever held
          "holding_periods": [  // Array of holding periods
            {
              "entry_timestamp": number,
              "exit_timestamp": number,
              "entry_block": number,
              "exit_block": number,
              "duration": number,  // Duration in seconds
              "entry_date": string,  // ISO 8601 date
              "exit_date": string,  // ISO 8601 date
              "duration_days": number  // Duration in days
            }
          ],
          "total_holding_duration": number,  // Total duration in seconds
          "is_current_holder": boolean,  // Whether user currently holds tokens
          "events": [  // Array of all deposit/withdraw events
            {
              "type": string,  // "DEPOSIT" or "WITHDRAW"
              "amount": string,  // Amount deposited/withdrawn
              "balance_after": string,  // Balance after the event
              "block": number,  // Block number
              "timestamp": number,  // Unix timestamp
              "datetime": string  // ISO 8601 datetime
            }
          ],
          "first_seen_date": string,  // ISO 8601 date
          "last_seen_date": string,  // ISO 8601 date
          "total_holding_duration_days": number  // Total duration in days
        }
      }
    }
  ]
}
```

This endpoint provides comprehensive data about Pendle gauge holders, including:
- Metadata with overall statistics and gauge summaries
- Current holders with their balances and last update timestamps
- Complete user histories with entry/exit tracking
- Detailed event logs for all deposits and withdrawals
- Holding period analysis with duration calculations
- Maximum balances held by each user