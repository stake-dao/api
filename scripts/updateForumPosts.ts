import { writeFile } from './utils'

interface ForumPost {
  id: string
  title: string
  url: string
  createdAt: string
  username: string
  reply?: boolean
  avatar?: string
  likes?: number
}

interface Forum {
  url: string
  /** Discourse usernames of the maintainers on that forum. */
  usernames: string[]
  /**
   * The forum refuses automated reads, so its posts are kept here by hand instead of being searched. Curve's Cloudflare
   * answers every path with a managed challenge to anything but a browser.
   */
  blocked?: boolean
  posts?: ForumPost[]
}

/** Per locker id. */
const FORUMS: Record<string, Forum> = {
  crv: {
    url: 'https://gov.curve.finance',
    usernames: ['Hubirb', 'chago0x', 'StakeDAO', 'Tube'],
    blocked: true,
    // https://gov.curve.finance/search.json?q=%40<username>%20order%3Alatest
    posts: [
      {
        id: '11106/15',
        title: 'Call for Proposals: Curve Risk Assessment and Market Monitoring',
        url: 'https://gov.curve.finance/t/call-for-proposals-curve-risk-assessment-and-market-monitoring/11106/15',
        createdAt: '2026-08-04T10:07:53.749Z',
        username: 'Hubert',
        reply: true,
        likes: 1,
      },
      {
        id: '11133/3',
        title: 'CrossWorlds: Proposal for Curve Risk Assessment & Market Monitoring',
        url: 'https://gov.curve.finance/t/crossworlds-proposal-for-curve-risk-assessment-market-monitoring/11133/3',
        createdAt: '2026-08-04T10:02:38.436Z',
        username: 'Hubert',
        reply: true,
        likes: 2,
      },
      {
        id: '11133/1',
        title: 'CrossWorlds: Proposal for Curve Risk Assessment & Market Monitoring',
        url: 'https://gov.curve.finance/t/crossworlds-proposal-for-curve-risk-assessment-market-monitoring/11133',
        createdAt: '2026-07-21T16:07:24.212Z',
        username: 'chago0x',
        likes: 2,
      },
      {
        id: '11069/2',
        title: 'sDOLA-long2 Repayment Funds Source Proposal',
        url: 'https://gov.curve.finance/t/sdola-long2-repayment-funds-source-proposal/11069/2',
        createdAt: '2026-05-04T14:58:10.216Z',
        username: 'Hubert',
        reply: true,
        likes: 2,
      },
      {
        id: '11062/6',
        title: 'CRV-long LlamaLend market recovery',
        url: 'https://gov.curve.finance/t/crv-long-llamalend-market-recovery/11062/6',
        createdAt: '2026-04-27T07:33:25.159Z',
        username: 'Hubert',
        reply: true,
      },
      {
        id: '10967/2',
        title: 'Amendment of Funding Proposal for Swiss Stake AG - Grant Proposal 2026',
        url: 'https://gov.curve.finance/t/amendment-of-funding-proposal-for-swiss-stake-ag-grant-proposal-2026/10967/2',
        createdAt: '2025-12-19T10:54:58.920Z',
        username: 'Hubert',
        reply: true,
        likes: 4,
      },
      {
        id: '10953/6',
        title: 'Funding proposal for Swiss Stake AG - Grant Proposal 2026',
        url: 'https://gov.curve.finance/t/funding-proposal-for-swiss-stake-ag-grant-proposal-2026/10953/6',
        createdAt: '2025-12-15T10:30:07.788Z',
        username: 'Hubert',
        reply: true,
        likes: 1,
      },
      {
        id: '10555/3',
        title: 'Reduce sfrxUSD-long LlamaLend market min rate from 0.5% to 0.1%',
        url: 'https://gov.curve.finance/t/reduce-sfrxusd-long-llamalend-market-min-rate-from-0-5-to-0-1/10555/3',
        createdAt: '2025-03-27T15:32:05.377Z',
        username: 'Hubert',
        reply: true,
      },
      {
        id: '10440/2',
        title: 'Proposal to add GHO/USR pool to the Gauge Controller',
        url: 'https://gov.curve.finance/t/proposal-to-add-gho-usr-pool-to-the-gauge-controller/10440/2',
        createdAt: '2025-01-20T09:43:55.777Z',
        username: 'Hubert',
        reply: true,
        likes: 1,
      },
      {
        id: '10204/43',
        title: 'Funding proposal for Swiss Stake AG, the company building Curve',
        url: 'https://gov.curve.finance/t/funding-proposal-for-swiss-stake-ag-the-company-building-curve/10204/43',
        createdAt: '2024-08-28T15:39:43.918Z',
        username: 'Hubert',
        reply: true,
        likes: 1,
      },
      {
        id: '9714/2',
        title: 'Add TriBSN on Ethereum mainnet to the Gauge controller',
        url: 'https://gov.curve.finance/t/add-tribsn-on-ethereum-mainnet-to-the-gauge-controller/9714/2',
        createdAt: '2023-10-26T09:19:54.539Z',
        username: 'Tube',
        reply: true,
        likes: 2,
      },
      {
        id: '9676/9',
        title: '[RFC] Alchemix veCRV whitelist & Recompensation Request',
        url: 'https://gov.curve.finance/t/rfc-alchemix-vecrv-whitelist-recompensation-request/9676/9',
        createdAt: '2023-10-24T13:42:38.460Z',
        username: 'Tube',
        reply: true,
        likes: 2,
      },
      {
        id: '9627/5',
        title: 'Lobby - bribery aggregator',
        url: 'https://gov.curve.finance/t/lobby-bribery-aggregator/9627/5',
        createdAt: '2023-09-20T10:45:40.486Z',
        username: 'Tube',
        reply: true,
        likes: 1,
      },
      {
        id: '9592/8',
        title: 'Proposal to Fund Several Curve SubDAOs from the Community Fund',
        url: 'https://gov.curve.finance/t/proposal-to-fund-several-curve-subdaos-from-the-community-fund/9592/8',
        createdAt: '2023-09-11T17:14:14.542Z',
        username: 'Tube',
        reply: true,
      },
      {
        id: '9389/4',
        title: 'A vote the kill sftxETH market on crvUSD',
        url: 'https://gov.curve.finance/t/a-vote-the-kill-sftxeth-market-on-crvusd/9389/4',
        createdAt: '2023-08-02T17:20:36.840Z',
        username: 'Tube',
        reply: true,
      },
      {
        id: '8694/2',
        title: 'Proposal to add axlUSDC<>USDC to the Gauge Controller',
        url: 'https://gov.curve.finance/t/proposal-to-add-axlusdc-usdc-to-the-gauge-controller/8694/2',
        createdAt: '2023-01-24T14:44:09.670Z',
        username: 'Tube',
        reply: true,
      },
      {
        id: '4476/2',
        title: 'Proposal to add OHM/FraxBP to the Gauge Controller',
        url: 'https://gov.curve.finance/t/proposal-to-add-ohm-fraxbp-to-the-gauge-controller/4476/2',
        createdAt: '2022-12-02T18:13:23.235Z',
        username: 'Tube',
        reply: true,
      },
      {
        id: '4244/18',
        title: 'Proposal to add CRV/yCRV gauge to the Gauge Controller',
        url: 'https://gov.curve.finance/t/proposal-to-add-crv-ycrv-gauge-to-the-gauge-controller/4244/18',
        createdAt: '2022-10-07T16:09:24.015Z',
        username: 'Tube',
        reply: true,
        likes: 2,
      },
      {
        id: '4240/2',
        title: 'Proposal to add MAI/LUSD to the Gauge Controller',
        url: 'https://gov.curve.finance/t/proposal-to-add-mai-lusd-to-the-gauge-controller/4240/2',
        createdAt: '2022-09-14T10:29:22.053Z',
        username: 'Tube',
        reply: true,
        likes: 2,
      },
      {
        id: '3958/19',
        title: 'Deploy a "FRAXBP" Pool & whitelist Frax for veCRV Staking',
        url: 'https://gov.curve.finance/t/deploy-a-fraxbp-pool-whitelist-frax-for-vecrv-staking/3958/19',
        createdAt: '2022-05-30T13:26:02.574Z',
        username: 'Tube',
        reply: true,
        likes: 2,
      },
      {
        id: '3637/95',
        title: 'Proposal to add sdTokens tokens pools to the gauge controller',
        url: 'https://gov.curve.finance/t/proposal-to-add-sdtokens-tokens-pools-to-the-gauge-controller/3637/95',
        createdAt: '2022-05-01T17:27:43.890Z',
        username: 'Tube',
        reply: true,
        likes: 4,
      },
      {
        id: '2567/2',
        title: 'Add CRV rewards on a gauge for SDT/WETH pool',
        url: 'https://gov.curve.finance/t/add-crv-rewards-on-a-gauge-for-sdt-weth-pool/2567/2',
        createdAt: '2022-02-14T14:13:45.982Z',
        username: 'Tube',
        reply: true,
        likes: 2,
      },
      {
        id: '2019/2',
        title: 'List MAI (miMatic) on Polygon',
        url: 'https://gov.curve.finance/t/list-mai-mimatic-on-polygon/2019/2',
        createdAt: '2021-08-03T10:10:38.531Z',
        username: 'Tube',
        reply: true,
        likes: 3,
      },
      {
        id: '1414/10',
        title: 'CIP#47 - Add StakeDAO to SmartWalletWhitelist',
        url: 'https://gov.curve.finance/t/cip-47-add-stakedao-to-smartwalletwhitelist/1414/10',
        createdAt: '2021-02-01T11:26:30.274Z',
        username: 'StakeDAO',
        reply: true,
      },
    ],
  },
  bal: { url: 'https://forum.balancer.fi', usernames: ['chago0x'] },
  fxs: { url: 'https://gov.frax.finance', usernames: ['chago0x'] },
  yfi: { url: 'https://gov.yearn.fi', usernames: ['chago0x', 'Tube'] },
  cake: { url: 'https://forum.pancakeswap.finance', usernames: ['chago0x', 'StakeDAO'] },
  spectra: { url: 'https://gov.spectra.finance', usernames: ['Hubirb', 'chago0x'] },
}

const DIR = 'api/forums'
const COUNT = 20

const searchPosts = async (forum: Forum, username: string): Promise<ForumPost[]> => {
  const q = encodeURIComponent(`@${username} order:latest`)
  const res = await fetch(`${forum.url}/search.json?q=${q}`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`${forum.url} answered ${res.status} for ${username}`)

  const data = await res.json()
  const topics = new Map<number, { title: string; slug: string }>((data.topics ?? []).map((t) => [t.id, t]))

  return (data.posts ?? []).flatMap((p) => {
    const topic = topics.get(p.topic_id)
    if (!topic) return []
    return [
      {
        id: `${p.topic_id}/${p.post_number}`,
        title: topic.title,
        url: `${forum.url}/t/${topic.slug}/${p.topic_id}${p.post_number > 1 ? `/${p.post_number}` : ''}`,
        createdAt: p.created_at,
        username: p.username,
        reply: p.post_number > 1,
        avatar: p.avatar_template && new URL(p.avatar_template.replace('{size}', '96'), forum.url).href,
        likes: p.like_count || undefined,
      },
    ]
  })
}

const byNewest = (a: ForumPost, b: ForumPost) => b.createdAt.localeCompare(a.createdAt)

const updateForumPosts = async () => {
  for (const [id, forum] of Object.entries(FORUMS)) {
    const write = (feed: { posts: ForumPost[]; blocked?: boolean }) =>
      writeFile({
        path: `${DIR}/${id}.json`,
        data: JSON.stringify(feed),
        log: {
          success: `✅ - ${id} forum posts have been updated!`,
          error: `❌ - An error occured during the ${id} forum posts update.`,
        },
      })

    if (forum.blocked) {
      write({ posts: [...(forum.posts ?? [])].sort(byNewest), blocked: true })
      continue
    }

    const results = await Promise.allSettled(forum.usernames.map((username) => searchPosts(forum, username)))
    for (const result of results) if (result.status === 'rejected') console.error(`❌ - ${id}: ${result.reason}`)

    // A forum that failed for every name keeps the file of the last run rather than going empty for an hour.
    if (results.every((result) => result.status === 'rejected')) continue

    const posts = new Map<string, ForumPost>()
    for (const result of results) {
      if (result.status === 'fulfilled') for (const post of result.value) posts.set(post.id, post)
    }
    write({ posts: [...posts.values()].sort(byNewest).slice(0, COUNT) })
  }
}

updateForumPosts()
