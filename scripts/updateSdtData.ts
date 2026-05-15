import { writeFile } from './utils'
import { getSdtData } from '../src/lib/sdt'

const updateSdtData = async () => {
  const sdtData = await getSdtData()

  writeFile({
    path: `api/sdt/index.json`,
    data: JSON.stringify(sdtData),
    log: {
      success: '✅ - SDT Data have been updated!',
      error: '❌ - An error occured during the SDT Data update.',
    },
  })
}

updateSdtData()
