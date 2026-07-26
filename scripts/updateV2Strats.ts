import { updateBalancerStrats_v2 } from './strategies/updateBalancerStrats'
import { updateCurveStrats_v2 } from './strategies/updateCurveStrats'

const PROMISES_INDEX = {
  0: 'curve',
  1: 'balander',
}

const updateStrats_v2 = async () => {
  const promises = await Promise.allSettled([updateCurveStrats_v2(), updateBalancerStrats_v2()])

  let failed = 0

  for (const [index, result] of promises.entries()) {
    if (result.status === 'rejected') {
      failed++
      console.error(`❌ - ${PROMISES_INDEX[index]} strats update fails`)
      console.error(result)
    }
  }

  // Same reason as `updateStrats.ts`: a rejection preserves the previous JSON, but the step has
  // to report failure so the commit step does not run on a partial update.
  if (failed > 0) {
    console.error(`❌ - ${failed}/${promises.length} v2 protocol update(s) failed — exiting non-zero`)
    process.exitCode = 1
  }
}

updateStrats_v2()
