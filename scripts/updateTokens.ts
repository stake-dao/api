import { writeFile } from './utils'
import { getTokens } from '../src/lib/tokens'

const updateTokens = async () => {
  const tokens = await getTokens()

  writeFile({
    path: `api/tokens/index.json`,
    data: JSON.stringify(tokens),
    log: {
      success: '✅ - Tokens have been updated!',
      error: '❌ - An error occured during the Tokens update.',
    },
  })
}

updateTokens()
