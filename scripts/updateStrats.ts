import updateCurveStrats from './strategies/updateCurveStrats'
import updateBalancerStrats from './strategies/updateBalancerStrats'
import updateYearnStrats from './strategies/updateYearnStrats'
import updatePancakeStrats from './strategies/updatePancakeStrats'
import updatePendleStrats from './strategies/updatePendleStrats'
import updatePassiveStrats from './strategies/updatePassiveStrats'

const PROMISES_INDEX = {
  0: 'curve',
  1: 'balancer',
  2: 'yearn',
  3: 'pancake',
  4: 'pendle',
  5: 'passive',
}

const updateStrats = async () => {
  const promises = await Promise.allSettled([
    updateCurveStrats(),
    updateBalancerStrats(),
    updateYearnStrats(),
    updatePancakeStrats(),
    updatePendleStrats(),
    updatePassiveStrats(),
  ])

  let failed = 0

  for (const [index, result] of promises.entries()) {
    if (result.status === 'rejected') {
      failed++
      console.error(`❌ - ${PROMISES_INDEX[index]} strats update fails`)
      console.error(result)
    }
  }

  // `allSettled` deliberately lets the other protocols finish, but the process must still exit
  // non-zero: `writeFileFromPromise` skips the write on a rejection, so the previous JSON is
  // preserved — and without this the step reported success and the commit step ran anyway,
  // hiding the fact that a protocol had produced nothing.
  if (failed > 0) {
    console.error(`❌ - ${failed}/${promises.length} protocol update(s) failed — exiting non-zero`)
    process.exitCode = 1
  }
}

updateStrats()
