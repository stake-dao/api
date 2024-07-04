import cached from '../../api/cherries/index.json'

////////////////////////////////////////////////////////////////
////   --- USER ---                                         ////
////////////////////////////////////////////////////////////////

export type User = {
  address: string
  timestamp: number
  points: string
  rate: string
  positions: number[]
}

// Copy usersCached in global var at execution
export let users: User[] = cached.users

export const setUser = (newUserData: User) => {
  const currentUserData = users.find((u) => u.address.toLowerCase() === newUserData.address.toLowerCase())

  if (typeof currentUserData !== 'undefined') {
    const indexOfUser = users.indexOf(currentUserData)
    users[indexOfUser] = newUserData
  } else {
    users.push(newUserData)
  }
}

interface GetUserArgs {
  address: string
  timestamp: number
}

export const getUser = (args: GetUserArgs): User => {
  const { address, timestamp } = args

  // Check if user exists
  let user: User | undefined = users.find((u) => u.address.toLowerCase() === address.toLowerCase())

  // Create User if it doesn't exists
  if (typeof user === 'undefined') {
    user = { address, timestamp, points: '0', rate: '0', positions: [] }
  }

  return user
}

////////////////////////////////////////////////////////////////
////   --- GLOBAL ---                                       ////
////////////////////////////////////////////////////////////////

export type Global = {
  lastSyncBlock: number
  timestamp: number
  points: string
  rate: string
  threeMTimestamp: number
  tenMTimestamp: number
  twentyFiveMTimestamp: number
  fiftyMTimestamp: number
  currentMultiplier: number
}

// Copy globalCached in global var at execution
let global: Global = cached.global

export const setGlobal = (newGlobal: Global) => {
  global = newGlobal
}

export const getGlobal = (): Global => {
  return global
}
