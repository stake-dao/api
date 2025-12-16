import { arbitrum, mainnet } from 'viem/chains'
import { writeFile } from '../../utils'
import { getIpor } from '../../../src/lib/strategies/curated/ipor'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const updateIporCuratedStrats = async () => {
  const history = {}
  const res = { [mainnet.id]: [], [arbitrum.id]: [] }

  const iporData = await getIpor()

  for (const el of iporData) {
    // Remove full history data
    res[el.chainId].push({ ...el, history: undefined })
    history[el.key] = []

    let lastTimestamp = dayjs.utc(el.history[0].blockTimestamp)

    // Keep one history data per day
    for (const h of el.history) {
      const blockTimestamp = dayjs.utc(h.blockTimestamp)

      if (blockTimestamp.isAfter(lastTimestamp, 'day')) {
        history[el.key].push(h)
        lastTimestamp = blockTimestamp
      }
    }
  }

  writeFile({
    path: `api/strategies/curated/ipor/${mainnet.id}.json`,
    data: JSON.stringify(res[mainnet.id]),
    log: {
      success: '✅ - IPOR Mainnet curated strategies have been updated!',
      error: '❌ - An error occured during the IPOR Mainnet curated strategies update.',
    },
  })

  writeFile({
    path: `api/strategies/curated/ipor/${arbitrum.id}.json`,
    data: JSON.stringify(res[arbitrum.id]),
    log: {
      success: '✅ - IPOR Arbitrum curated strategies have been updated!',
      error: '❌ - An error occured during the IPOR Arbitrum curated strategies update.',
    },
  })

  writeFile({
    path: `api/strategies/curated/ipor/index.json`,
    data: JSON.stringify([...res[mainnet.id], ...res[arbitrum.id]]),
    log: {
      success: '✅ - IPOR curated strategies have been updated!',
      error: '❌ - An error occured during the IPOR curated strategies update.',
    },
  })

  Promise.all(
    Object.keys(history).map((key) =>
      writeFile({
        path: `api/strategies/curated/ipor/history/${key}.json`,
        data: JSON.stringify(history[key]),
        log: {
          success: `✅ - ${key} strategies history have been updated!`,
          error: `❌ - An error occured during the ${key} strategies history update.`,
        },
      }),
    ),
  )
}

export default updateIporCuratedStrats
