import updateIporCuratedStrats from './strategies/curated/updateIporCuratedStrats'

const PROMISES_INDEX = {
  0: 'ipor',
}

const updateCuratedStrats = async () => {
  const promises = await Promise.allSettled([updateIporCuratedStrats()])

  for (const [index, result] of promises.entries()) {
    if (result.status === 'rejected') {
      console.error(`❌ - ${PROMISES_INDEX[index]} curated strats update fails`)
      console.error(result)
    }
  }
}

updateCuratedStrats()
