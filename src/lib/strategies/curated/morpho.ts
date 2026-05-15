import { fetchMorphoVaults } from '@stake-dao/reader'
import memoize from 'memoizee'
import { MEMO_MAX_AGE } from '../../utils'

require('dotenv').config()

export const getMorpho = memoize(async () => fetchMorphoVaults(), { maxAge: MEMO_MAX_AGE })
