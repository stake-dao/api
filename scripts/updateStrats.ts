import updateCurveStrats from './strategies/updateCurveStrats'
import updateBalancerStrats from './strategies/updateBalancerStrats'
import updateYearnStrats from './strategies/updateYearnStrats'
import updatePancakeStrats from './strategies/updatePancakeStrats'
import updatePendleStrats from './strategies/updatePendleStrats'
import updateAngleStrats from './strategies/updateAngleStrats'

const PROMISES_INDEX = {
  0: 'curve',
  1: 'balancer',
  2: 'yearn',
  3: 'pancake',
  4: 'pendle',
  5: 'angle',
}

const updateStrats = async () => {
  await updateCurveStrats()
  await updatePancakeStrats()

  const promises = await Promise.allSettled([
    updateBalancerStrats(),
    updateYearnStrats(),
    updatePendleStrats(),
    updateAngleStrats(),
  ])

  for (const [index, result] of promises.entries()) {
    if (result.status === 'rejected') {
      console.error(`❌ - ${PROMISES_INDEX[index]} strats update fails`)
      console.error(result)
    }
  }
}

updateStrats()
