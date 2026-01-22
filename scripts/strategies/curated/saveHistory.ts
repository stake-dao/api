import { readFile, writeFile } from '../../utils'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const saveHistory = async (infra: string, stratsData: any[]) => {
  const history = {}

  for (const el of stratsData) {
    try {
      history[el.key] = readFile({ path: `api/strategies/curated/${infra}/history/${el.key}.json` })
    } catch {
      history[el.key] = []
    }

    const lastTimestamp = dayjs(
      history[el.key]?.length > 0 ? history[el.key][history[el.key].length - 1]?.timestamp * 1000 || 0 : 0,
    )
    const now = dayjs()

    if (now.isAfter(lastTimestamp, 'day')) {
      history[el.key].push({
        timestamp: now.unix(),
        tvl: el.tvl,
        apr: el.apr.current.total,
      })
    }
  }

  Promise.all(
    Object.keys(history).map((key) =>
      writeFile({
        path: `api/strategies/curated/${infra}/history/${key}.json`,
        data: JSON.stringify(history[key]),
        log: {
          success: `✅ - ${key} strategies history have been updated!`,
          error: `❌ - An error occured during the ${key} strategies history update.`,
        },
      }),
    ),
  )
}

export default saveHistory
