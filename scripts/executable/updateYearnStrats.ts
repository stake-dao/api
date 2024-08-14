import updateYearnStrats from "../strategies/updateYearnStrats"

const executeUpdateCurveStrats = async () => {
    await updateYearnStrats()
}

executeUpdateCurveStrats()