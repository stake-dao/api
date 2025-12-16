import { fetchLagoonVaults } from '@stake-dao/reader'
import memoize from 'memoizee'
import { MEMO_MAX_AGE } from '../../utils'

require('dotenv').config()

export const getLagoon = memoize(async () => fetchLagoonVaults(), { maxAge: MEMO_MAX_AGE })
