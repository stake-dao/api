# Stake DAO API

This repository is meant to be used as API endpoints, with periodical updates through GitHub workflows

## Data

### Lockers data

Endpoint : [/api/lockers/data.json](https://raw.githubusercontent.com/stake-dao/api/main/api/lockers/data.json)

Data type :

```
{
    name: string;
    totalUsers: number;
    totalBalanceUsd: number;
    supportedAssets: {
        contractAddress: string;
        symbol: string;
        slug: string;
        baseSlug: string;
        supply: number;
        apr: number;
        aprBreakdown: {
            slug: string;
            apr: number;
        }[];
        fee: number;
        users: number;
        exchangeRatio: number | null;
        balanceUSD: number;
        chain: string;
    }[];
}
```

