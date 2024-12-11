import updateCurveStrats from "../strategies/updateCurveStrats"
import updateAngleStrats from "./updateAngleStrats"
import updateBalancerStrats from "./updateBalancerStrats"
import updatePancakeStrats from "./updatePancakeStrats"
import updatePendleStrats from "./updatePendleStrats";
import updateYearnStrats from "./updateYearnStrats";

const executeUpdateStrats = async (protocol) => {
    switch (protocol) {
      case 'curve':
        await updateCurveStrats()
        break
      case 'angle':
        await updateAngleStrats()
        break
      case 'balancer':
        await updateBalancerStrats()
        break
      case 'pancake':
        await updatePancakeStrats()
        break
      case 'pendle':
        await updatePendleStrats()
        break
      case 'yearn':
        await updateYearnStrats()
        break
      default :
        break
    }
}

const protocolToUpdate = process.argv.slice(2)
for(const protocol of protocolToUpdate){
    executeUpdateStrats(protocol)
}
