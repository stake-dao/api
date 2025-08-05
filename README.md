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

The Pendle holders API provides comprehensive data about gauge holders, their balances, and historical tracking.

#### Available Endpoints

##### 1. Summary (Root Endpoint)
**Endpoint**: [/api/strategies/pendle/holders](https://api.stakedao.org/api/strategies/pendle/holders)

Returns a lightweight summary of all gauges.

```typescript
{
  snapshot_date: string,
  pendle_locker: string,
  total_gauges: number,
  total_current_holders: number,
  all_time_unique_users: number,
  average_holding_duration_days: number,
  gauges: Array<{
    gauge: string,
    symbol: string,
    current_holders: number,
    all_time_users: number,
    current_supply: string
  }>
}
```

##### 2. Current Holders Snapshot
**Endpoint**: [/api/strategies/pendle/holders/current](https://api.stakedao.org/api/strategies/pendle/holders/current)

Get current holders for all gauges with their balances.

```typescript
{
  snapshot_date: string,
  pendle_locker: string,
  total_gauges: number,
  total_current_holders: number,
  gauges: Array<{
    gauge_id: string,
    token: {
      address: string,
      symbol: string
    },
    current_holders: number,
    current_supply: string,
    holders: Array<{
      user: string,
      balance: string,
      last_updated: number
    }>
  }>
}
```

##### 3. Historical Holders Data
**Endpoint**: [/api/strategies/pendle/holders/historical](https://api.stakedao.org/api/strategies/pendle/holders/historical)

Get complete historical data including holding periods and durations.

**Query Parameters**:
- `gauge` (optional): Filter by specific gauge address
- `token` (optional): Filter by specific token address (PT token)
- `include_events` (optional, default: false): Include detailed event history

Note: Use either `gauge` or `token` parameter, not both.

```typescript
{
  snapshot_date: string,
  pendle_locker: string,
  gauges: Array<{
    gauge_id: string,
    token: {
      address: string,
      symbol: string
    },
    stats: {
      current_holders: number,
      all_time_users: number,
      average_holding_duration_days: number
    },
    user_histories: Array<{
      user: string,
      first_seen_date: string,
      last_seen_date: string,
      is_current_holder: boolean,
      max_balance: string,
      total_holding_duration_days: number,
      holding_periods: Array<{
        entry_date: string,
        exit_date: string | null,
        duration_days: number
      }>
    }>
  }>
}
```

##### 4. Period Analysis
**Endpoint**: [/api/strategies/pendle/holders/period](https://api.stakedao.org/api/strategies/pendle/holders/period)

Get holders during a specific time period.

**Query Parameters**:
- `start_date` (required): ISO date string
- `end_date` (required): ISO date string
- `gauge` (optional): Filter by specific gauge address
- `token` (optional): Filter by specific token address (PT token)
- `min_duration_days` (optional): Minimum holding duration in the period

Note: Use either `gauge` or `token` parameter, not both.

```typescript
{
  period: {
    start: string,
    end: string
  },
  gauges: Array<{
    gauge_id: string,
    token: {
      address: string,
      symbol: string
    },
    holders_in_period: number,
    holders: Array<{
      user: string,
      holding_duration_days: number,
      max_balance_in_period: string,
      is_current_holder: boolean,
      entry_date: string,
      exit_date: string | null
    }>
  }>
}
```

##### 5. Holder Analytics
**Endpoint**: [/api/strategies/pendle/holders/analytics](https://api.stakedao.org/api/strategies/pendle/holders/analytics)

Get aggregated analytics and statistics.

**Query Parameters**:
- `gauge` (optional): Filter by specific gauge address

```typescript
{
  snapshot_date: string,
  summary: {
    total_gauges: number,
    total_current_holders: number,
    all_time_unique_users: number,
    average_holding_duration_days: number
  },
  holding_duration_distribution: {
    less_than_day: number,
    '1_to_7_days': number,
    '7_to_30_days': number,
    '30_to_90_days': number,
    more_than_90_days: number
  },
  top_holders: Array<{
    user: string,
    gauge_id: string,
    token: {
      address: string,
      symbol: string
    },
    max_balance: string,
    total_holding_duration_days: number,
    is_current_holder: boolean
  }>,
  gauge_analytics: Array<{
    gauge_id: string,
    token: {
      address: string,
      symbol: string
    },
    current_holders: number,
    all_time_users: number,
    average_holding_duration_days: number,
    longest_holder: {
      user: string,
      duration_days: number
    },
    largest_holder: {
      user: string,
      max_balance: string
    }
  }>
}
```

##### 6. User History
**Endpoint**: [/api/strategies/pendle/holders/user/{address}](https://api.stakedao.org/api/strategies/pendle/holders/user/0x...)

Get complete history for a specific user across all gauges.

```typescript
{
  user: string,
  summary: {
    total_gauges_participated: number,
    is_current_holder: boolean,
    total_holding_duration_days: number
  },
  gauge_participations: Array<{
    gauge_id: string,
    token: {
      address: string,
      symbol: string
    },
    is_current_holder: boolean,
    max_balance: string,
    total_holding_duration_days: number,
    holding_periods: Array<{
      entry_date: string,
      exit_date: string | null,
      duration_days: number
    }>,
    events: Array<{
      type: 'deposit' | 'withdraw',
      amount: string,
      datetime: string
    }>
  }>
}
```

#### Example Usage

```bash
# Get current holders
curl https://api.stakedao.org/strategies/pendle/holders/current

# Get historical data for a specific gauge
curl "https://api.stakedao.org/strategies/pendle/holders/historical?gauge=0x03dE17a785d1CE9227ccA0388aE4ed176630b203&include_events=true"

# Get historical data for a specific token
curl "https://api.stakedao.org/strategies/pendle/holders/historical?token=0x4D7356369273c6373E6C5074fe540CB070acfE6b&include_events=true"

# Get holders who held tokens in Q1 2024
curl "https://api.stakedao.org/strategies/pendle/holders/period?start_date=2024-01-01&end_date=2024-03-31"

# Get holders for a specific token in Q1 2024
curl "https://api.stakedao.org/strategies/pendle/holders/period?start_date=2024-01-01&end_date=2024-03-31&token=0x4D7356369273c6373E6C5074fe540CB070acfE6b"

# Get analytics for all gauges
curl https://api.stakedao.org/strategies/pendle/holders/analytics

# Get analytics for a specific token
curl "https://api.stakedao.org/strategies/pendle/holders/analytics?token=0x4D7356369273c6373E6C5074fe540CB070acfE6b"

# Get history for a specific user
curl https://api.stakedao.org/strategies/pendle/holders/user/0x8A5c3326fadb5D2569cDe6e16Ac1AcD38fE1392b
```

#### Data Update Frequency

The holder data is updated every 5 minutes via the GitHub workflow `pendle-gauge-holders.yml`.

#### Notes

- Gauges with zero holders are automatically filtered out from responses to reduce payload size
- The `all_time_users` field represents the total number of unique users who have ever held tokens in a gauge