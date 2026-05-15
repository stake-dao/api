import { tokenWithId } from '@stake-dao/constants'
import { arbitrum, base, fraxtal, mainnet, optimism, sonic } from 'viem/chains'

const baseTokens = {
  curve: {
    [mainnet.id]: tokenWithId('crv', mainnet.id)!.address,
    [sonic.id]: tokenWithId('crv', sonic.id)!.address,
    [fraxtal.id]: tokenWithId('crv', fraxtal.id)!.address,
    [arbitrum.id]: tokenWithId('crv', arbitrum.id)!.address,
    [base.id]: tokenWithId('crv', base.id)!.address,
    [optimism.id]: tokenWithId('crv', optimism.id)!.address,
  },
  balancer: {
    [mainnet.id]: tokenWithId('bal', mainnet.id)!.address,
  },
  yearn: {
    [mainnet.id]: tokenWithId('dyfi', mainnet.id)!.address,
  },
  pendle: {
    [mainnet.id]: tokenWithId('pendle', mainnet.id)!.address,
  },
}

export default baseTokens
