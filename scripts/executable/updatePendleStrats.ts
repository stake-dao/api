import updatePendleStrats from "../strategies/updatePendleStrats"

const executeUpdateCurveStrats = async () => {
    await updatePendleStrats()
}

executeUpdateCurveStrats()