import { updateBalancerStrats_v2 } from './strategies/updateBalancerStrats'
import { updateCurveStrats_v2 } from './strategies/updateCurveStrats'

const PROMISES_INDEX = {
  0: 'curve',
  1: 'balander',
}

const updateStrats_v2 = async () => {
  const promises = await Promise.allSettled([updateCurveStrats_v2(), updateBalancerStrats_v2()])

  for (const [index, result] of promises.entries()) {
    if (result.status === 'rejected') {
      console.error(`❌ - ${PROMISES_INDEX[index]} strats update fails`)
      console.error(result)
    }
  }
}

updateStrats_v2()
