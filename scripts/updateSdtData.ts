import { writeFile } from './utils'
import { getLegacySdtData, getSdtData } from '../src/lib/sdt'

const updateSdtData = async () => {
  const sdtData = await getSdtData()
  const legacySdtData = await getLegacySdtData()

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
}

updateSdtData()
