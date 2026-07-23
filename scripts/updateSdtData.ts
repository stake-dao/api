import { writeFile } from './utils'
import { getLegacySdtData, getSdtBuybackData, getSdtData } from '../src/lib/sdt'

const updateSdtData = async () => {
  const sdtData = await getSdtData()
  const legacySdtData = await getLegacySdtData()
  const sdtBuyback = await getSdtBuybackData()

  writeFile({
    path: `api/sdt/index.json`,
    data: JSON.stringify(sdtData),
    log: {
      success: '✅ - SDT Data have been updated!',
      error: '❌ - An error occured during the SDT Data update.',
    },
  })

  writeFile({
    path: `api/sdt/legacy/index.json`,
    data: JSON.stringify(legacySdtData),
    log: {
      success: '✅ - Legacy SDT Data have been updated!',
      error: '❌ - An error occured during the Legacy SDT Data update.',
    },
  })

  writeFile({
    path: `api/sdt/buyback.json`,
    data: JSON.stringify(sdtBuyback),
    log: {
      success: '✅ - SDT Buyback Data have been updated!',
      error: '❌ - An error occured during the SDT Buyback Data update.',
    },
  })
}

updateSdtData()
