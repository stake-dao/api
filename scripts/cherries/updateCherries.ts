import { getGlobal, setGlobal, setUser, users } from './classes'
import { getBuyEvents, getDepositorV2Events, getPoolEvents, getPoolV3Events } from './events'
import { handleAddInPool, handleAddInV3Pool, handleMint, handleUpdate } from './handlers'
import { bscPublicClient } from './chain'
import { writeFile } from '../utils'

const main = async () => {
  const fromBlock = getGlobal().lastSyncBlock + 1
  // const toBlockBI = await bscPublicClient.getBlockNumber()
  const toBlockBI = BigInt(42720332)
  const toBlock = Number(toBlockBI)
  const toBlockTimestamp = Number((await bscPublicClient.getBlock({ blockNumber: toBlockBI })).timestamp)

  const eventsPromises = await Promise.allSettled([
    getDepositorV2Events(fromBlock, toBlock),
    getPoolV3Events(fromBlock, toBlock),
    getPoolEvents(fromBlock, toBlock),
    getBuyEvents(fromBlock, toBlock),
  ])

  const events = [
    ...eventsPromises[0]['value'].map((e) => ({ ...e, type: 'Mint' })),
    ...eventsPromises[1]['value'].map((e) => ({ ...e, type: 'v3 Pool' })),
    ...eventsPromises[2]['value'].map((e) => ({ ...e, type: 'Pool' })),
    ...eventsPromises[3]['value'].map((e) => ({ ...e, type: 'Mint' })),
  ].sort((a, b) => a.blockNumber - b.blockNumber)

  for (const event of events) {
    switch (event.type) {
      case 'Mint':
        const { user: userFromMint, global: globalFromMint } = await handleMint(event)
        setUser(userFromMint)
        setGlobal(globalFromMint)
        break
      case 'v3 Pool':
        const { user: userFromV3Pool, global: globalFromV3Pool } = await handleAddInV3Pool(event)
        setUser(userFromV3Pool)
        setGlobal(globalFromV3Pool)
        break
      case 'Pool':
        const { user: userFromPool, global: globalFromPool } = await handleAddInPool(event)
        setUser(userFromPool)
        setGlobal(globalFromPool)
        break
      default:
        break
    }
  }

  const usersToUpdate = [...users]
  for (const user of usersToUpdate) {
    console.log(`-- Updating user ${user.address}`)
    const { user: updatedUser, global: updateGlobal } = await handleUpdate({
      user,
      blockNumber: toBlock,
      timestamp: toBlockTimestamp,
    })
    setUser(updatedUser)
    setGlobal(updateGlobal)
  }

  writeFile({
    path: `api/cherries/index.json`,
    data: JSON.stringify({
      global: { ...getGlobal(), lastSyncBlock: toBlock },
      users: users,
    }),
    log: {
      success: '✅ - Cherries data have been updated!',
      error: '❌ - An error occured during the Cherries data update.',
    },
  })
}

main()
