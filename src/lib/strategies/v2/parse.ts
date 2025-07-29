import { zeroAddress } from 'viem'
import { getOnlyboostData } from '@stake-dao/reader'
import { arbitrum, base, fraxtal, mainnet, optimism, sonic } from 'viem/chains'

const V2_FEES = 17

const parseAsset = (asset) => ({
  id: asset.id,
  name: asset.name,
  symbol: asset.symbol,
  address: asset.address,
  decimals: asset.decimals,
})

const baseTokens = {
  curve: {
    [mainnet.id]: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    [sonic.id]: '0x5Af79133999f7908953E94b7A5CF367740Ebee35',
    [fraxtal.id]: '0x331B9182088e2A7d6D3Fe4742AbA1fB231aEcc56',
    [arbitrum.id]: '0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978',
    [base.id]: '0x8Ee73c484A26e0A5df2Ee2a4960B789967dd0415',
    [optimism.id]: '0x0994206dfE8De6Ec6920FF4D779B0d950605Fb53',
  },
  balancer: {
    [mainnet.id]: '0xba100000625a3754423978a60c9317c58a424e3D',
  },
  yearn: {
    [mainnet.id]: '0x41252E8691e964f7DE35156B68493bAb6797a275',
  },
  pendle: {
    [mainnet.id]: '0x808507121B80c02388fAd14726482e061B8da827',
  },
}

export const parseV2Strats = (rawStrats: any[]) => {
  try {
    return rawStrats.map((s) => {
      const isLending = s.asset.name.startsWith('Llamalend')

      const lpToken = parseAsset(s.asset)
      const coins = s.asset.components.map((c) => parseAsset(c.childAsset))

      let name = coins.map((c) => c.symbol).join('/')
      if (name.length > 26 || lpToken?.name?.startsWith('CrossCurve')) name = lpToken.symbol
      if (isLending) name = s.asset.name

      const lpPriceInUsd = Number(s.asset.price)

      const compoundedYieldKey = isLending ? 'LENDING_INTEREST' : 'TRADING_FEES'
      const tradingApy = (s.gauge.aprDetails.find((el) => el.yieldType === compoundedYieldKey)?.aprUSD || 0) * 100
      const otherRewards = s.gauge.aprDetails.filter((el) => el.yieldType !== compoundedYieldKey)

      const rewards = otherRewards.map((r) => ({
        token: parseAsset(r.asset),
        price: Number(r.asset.price),
        aprInToken: r.apr,
        apr: Number(r.aprUSD) * 100,
        streaming: true,
        periodFinish: 2000000000,
        yieldType: r.yieldType,
      }))

      const metadata: any = {}
      for (const m of s.gauge.metadata) metadata[m.key] = m.value

      // Current
      const totalSupply = BigInt(s.totalSupply)
      const convexSupply = BigInt(s.sidecarBalance)
      const stakeDaoSupply = totalSupply - convexSupply

      const onlyboost = getOnlyboostData(
        {
          active: s.sidecar !== zeroAddress,
          convexImpl: s.sidecar,
          totalSupply,
          convexSupply,
          stakeDaoSupply,
          convexStrategyHoldings: BigInt(metadata.convexTotalSupply || '0'),
          convexWorkingBalance: BigInt(metadata.workingBalanceConvex || '0'),
          convexOptSupply: convexSupply, // TODO
          stakeDaoOptSupply: stakeDaoSupply, // TODO
          claimableData: [],
        },
        '1', // TODO
        '1', // TODO
        '799624226808879037328429575', // TODO
        BigInt(s.gauge.totalSupply),
        stakeDaoSupply,
        BigInt(metadata.workingBalance || '0'),
        totalSupply,
        lpPriceInUsd,
      )

      const boost = onlyboost.boost
      const baseReward = rewards.find(
        (r) => r.token.address.toLowerCase() === baseTokens.curve[s.chainId].toLowerCase(),
      )
      const maxApr = baseReward?.apr || 0
      const baseRewardApr = (maxApr / 2.5) * boost * ((100 - V2_FEES) / 100)

      const aprDetails = [
        {
          label: isLending ? 'Lending' : 'Trading Fees (APY)',
          value: [tradingApy],
        },
        ...rewards.map((r) =>
          baseReward && r.token.symbol === baseReward.token.symbol
            ? {
                label: `${r.token.symbol} APR (incl. ${boost.toFixed(2)}x boost)`,
                value: [baseRewardApr || 0],
              }
            : {
                label: `${r.token.symbol} APR`,
                value: [r.apr || 0],
              },
        ),
      ]
      const aprTotal = aprDetails.reduce((total, x) => {
        for (const v of x.value) total += v
        return total
      }, 0)

      return {
        key: s.id,
        isLending,
        name,
        type: 'factory-stable-ng',
        version: 2,
        protocol: 'curve',
        chainId: s.chainId,
        vault: s.address,
        lpToken,
        gaugeAddress: s.gauge.address,
        gauge: {
          address: s.gauge.address,
          totalSupply: s.gauge.totalSupply,
          totalSupplyUsd: s.gauge.totalSupplyUSD,
          extraRewards: [],
        },
        coins,
        underlyingCoins: [],
        lpPriceInUsd,
        streaming: true,
        tvl: Number(s.totalSupplyUSD),
        apr: {
          boost,
          current: { total: aprTotal, details: aprDetails },
        },
        rewards,
        tradingApy,
        minApr: maxApr / 2.5,
        maxApr,
        totalSupply: s.totalSupply,
        workingBalance: metadata?.workingBalance || '0',
        onlyboost,
        convexPool:
          metadata.pid && metadata.convexBaseRewardPool
            ? {
                id: Number(metadata.pid),
                crvRewards: metadata.convexBaseRewardPool,
              }
            : undefined,
      }
    })
  } catch (e) {
    console.error(e)
    throw e
  }
}
