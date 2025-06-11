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
  "lp-holder": string,  // Pendle locker address
  "gauge_count": number,
  "gauges": [
    {
      "id": string,  // Gauge address
      "lpt": string,  // PT token address (if available)
      "lpt_symbol": string,  // PT token symbol (if available)
      "holders": [
        {
          "user": string,  // User address
          "balance": string  // Current balance
        }
      ],
      "holder_count": number,  // Current number of holders
      "historical_data": [  // All users who have ever held tokens
        {
          "user": string,  // User address
          "entry_block": number,  // Block when user first entered
          "entry_ts": string,  // Timestamp when user first entered
          "max_balance": string,  // Maximum balance user ever held
          "exit_block": number,  // Block when user exited (if applicable)
          "exit_ts": string,  // Timestamp when user exited (if applicable)
          "is_past_user": boolean  // True if user has exited
        }
      ],
      "past_users": [  // Users who have exited the market
        {
          "user": string,
          "entry_block": number,
          "entry_ts": string,
          "max_balance": string,
          "exit_block": number,
          "exit_ts": string,
          "is_past_user": true
        }
      ],
      "total_unique_users": number,  // Total unique users (current + past)
      "past_users_count": number  // Number of users who have exited
    }
  ]
}
```

This endpoint provides comprehensive data about Pendle gauge holders, including:
- Current holders with their balances
- Historical data for all users who have ever held tokens
- Past users who have entered and exited the market
- Entry/exit timestamps and blocks for tracking user behavior
- Maximum balances held by each user