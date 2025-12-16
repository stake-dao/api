import { arbitrum } from 'viem/chains'
import { writeFile } from '../../utils'
import { getMorpho } from '../../../src/lib/strategies/curated/morpho'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import saveHistory from './saveHistory'

dayjs.extend(utc)

const updateMorphoCuratedStrats = async () => {
  const morphoData = await getMorpho()

  writeFile({
    path: `api/strategies/curated/morpho/index.json`,
    data: JSON.stringify(morphoData),
    log: {
      success: '✅ - Morpho curated strategies have been updated!',
      error: '❌ - An error occured during the Morpho curated strategies update.',
    },
  })

  saveHistory("morpho", morphoData)
}

export default updateMorphoCuratedStrats
