import { arbitrum } from 'viem/chains'
import { readFile, writeFile } from '../../utils'
import { getLagoon } from '../../../src/lib/strategies/curated/lagoon'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import saveHistory from './saveHistory'

dayjs.extend(utc)

const updateLagoonCuratedStrats = async () => {
  const lagoonData = await getLagoon()

  writeFile({
    path: `api/strategies/curated/lagoon/index.json`,
    data: JSON.stringify(lagoonData),
    log: {
      success: '✅ - Lagoon curated strategies have been updated!',
      error: '❌ - An error occured during the Lagoon curated strategies update.',
    },
  })

  saveHistory("lagoon", lagoonData)
}

export default updateLagoonCuratedStrats
