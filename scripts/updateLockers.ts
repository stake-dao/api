import { writeFile } from './utils'
import { getLockers } from '../src/lib/lockers'

const updateLockers = async () => {
  const lockers = await getLockers()

  writeFile({
    path: `api/lockers/index.json`,
    data: JSON.stringify(lockers),
    log: {
      success: '✅ - Lockers have been updated!',
      error: '❌ - An error occured during the Lockers update.',
    },
  })
}

updateLockers()
