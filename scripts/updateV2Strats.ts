import updateCurveStrats, { updateCurveStrats_v2 } from './strategies/updateCurveStrats'
import updateBalancerStrats from './strategies/updateBalancerStrats'
import updateYearnStrats from './strategies/updateYearnStrats'
import updatePancakeStrats from './strategies/updatePancakeStrats'
import updatePendleStrats from './strategies/updatePendleStrats'
import updateAngleStrats from './strategies/updateAngleStrats'
import updatePassiveStrats from './strategies/updatePassiveStrats'
import updateStakeDaoStrats from './strategies/updateStakeDaoStrats'

const PROMISES_INDEX = {
  0: 'curve',
}

const updateStrats_v2 = async () => {
  const promises = await Promise.allSettled([updateCurveStrats_v2()])

  for (const [index, result] of promises.entries()) {
    if (result.status === 'rejected') {
      console.error(`❌ - ${PROMISES_INDEX[index]} strats update fails`)
      console.error(result)
    }
  }
}

updateStrats_v2()
