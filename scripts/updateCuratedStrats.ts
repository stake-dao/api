import updateIporCuratedStrats from './strategies/curated/updateIporCuratedStrats'
import updateLagoonCuratedStrats from './strategies/curated/updateLagoonCuratedStrats'
import updateMorphoCuratedStrats from './strategies/curated/updateMorphoCuratedStrats'

const PROMISES_INDEX = {
  0: 'ipor',
  1: 'lagoon',
  2: 'morpho',
}

const updateCuratedStrats = async () => {
  const promises = await Promise.allSettled([
    updateIporCuratedStrats(),
    updateLagoonCuratedStrats(),
    updateMorphoCuratedStrats(),
  ])

  for (const [index, result] of promises.entries()) {
    if (result.status === 'rejected') {
      console.error(`❌ - ${PROMISES_INDEX[index]} curated strats update fails`)
      console.error(result)
    }
  }
}

updateCuratedStrats()
