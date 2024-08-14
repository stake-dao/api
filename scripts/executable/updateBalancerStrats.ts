import updateBalancerStrats from "../strategies/updateBalancerStrats"

const executeUpdateCurveStrats = async () => {
    await updateBalancerStrats()
}

executeUpdateCurveStrats()