import updatePancakeStrats from "../strategies/updatePancakeStrats"

const executeUpdateCurveStrats = async () => {
    await updatePancakeStrats()
}

executeUpdateCurveStrats()