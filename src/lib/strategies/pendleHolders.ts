import memoize from 'memoizee'
import * as fs from 'fs'
import * as path from 'path'
import { MEMO_MAX_AGE } from '../utils'

// ============================================================================
// Type Definitions
// ============================================================================

interface HoldingPeriod {
  entry_timestamp: number
  exit_timestamp: number | null
  entry_block: number
  exit_block: number | null
  duration: number
  entry_date: string
  exit_date: string | null
  duration_days: number
}

interface UserEvent {
  type: 'DEPOSIT' | 'WITHDRAW'
  amount: string
  balance_after: string
  block: number
  timestamp: number
  datetime: string
}

interface UserHistory {
  first_seen: number
  last_seen: number
  entry_timestamp: number
  exit_timestamp: number | null
  entry_block: number
  exit_block: number | null
  max_balance: number
  holding_periods: HoldingPeriod[]
  total_holding_duration: number
  is_current_holder: boolean
  events: UserEvent[]
  first_seen_date: string
  last_seen_date: string
  total_holding_duration_days: number
}

interface GaugeToken {
  address: string
  symbol: string
}

interface GaugeStats {
  total_deposited: string
  total_withdrawn: string
  current_supply: string
  current_holders: number
  total_users: number
}

// Per-gauge JSON structure
export interface GaugeData {
  gauge_id: string
  vault_id: string
  token: GaugeToken
  last_block?: number
  last_updated?: string
  stats: GaugeStats
  current_holders: Record<string, string>
  user_histories: Record<string, UserHistory>
}

// Metadata file structure
export interface HoldersMetadata {
  snapshot_date: string
  total_gauges: number
  total_holders: number
  total_users: number
}

// ============================================================================
// File System Helpers
// ============================================================================

const PENDLE_HOLDERS_DIR = 'api/strategies/pendle/holders'
const METADATA_FILE = '_metadata.json'

/**
 * Read the metadata file
 */
const readMetadata = (): HoldersMetadata | null => {
  const filePath = path.join(PENDLE_HOLDERS_DIR, METADATA_FILE)
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data) as HoldersMetadata
  } catch (error) {
    console.error(`Error reading metadata file: ${error}`)
    return null
  }
}

/**
 * Read a single gauge file
 */
const readGaugeFile = (gaugeId: string): GaugeData | null => {
  // Try lowercase first (standard)
  const filePath = path.join(PENDLE_HOLDERS_DIR, `${gaugeId.toLowerCase()}.json`)
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data) as GaugeData
  } catch {
    // Try with original case
    const filePathOriginal = path.join(PENDLE_HOLDERS_DIR, `${gaugeId}.json`)
    try {
      const data = fs.readFileSync(filePathOriginal, 'utf8')
      return JSON.parse(data) as GaugeData
    } catch (error) {
      console.error(`Error reading gauge file ${gaugeId}: ${error}`)
      return null
    }
  }
}

/**
 * List all gauge files in the directory
 */
const listGaugeFiles = (): string[] => {
  try {
    const files = fs.readdirSync(PENDLE_HOLDERS_DIR)
    return files.filter((f) => f.endsWith('.json') && f !== METADATA_FILE).map((f) => f.replace('.json', ''))
  } catch (error) {
    console.error(`Error listing gauge files: ${error}`)
    return []
  }
}

// ============================================================================
// Core Data Functions
// ============================================================================

/**
 * Get all gauge data by reading individual gauge files
 */
const getAllGaugesData = memoize(
  async (): Promise<GaugeData[]> => {
    const gaugeIds = listGaugeFiles()
    const gauges: GaugeData[] = []

    for (const gaugeId of gaugeIds) {
      const gauge = readGaugeFile(gaugeId)
      if (gauge) {
        gauges.push(gauge)
      }
    }

    return gauges
  },
  { maxAge: MEMO_MAX_AGE },
)

/**
 * Compute metadata from gauge files
 */
const computeMetadataFromGauges = (gauges: GaugeData[]): HoldersMetadata => {
  // Get unique current holders across all gauges
  const allCurrentHolders = new Set<string>()
  // Get unique users across all gauges
  const allUsers = new Set<string>()
  // Find the latest update date
  let latestUpdate = ''

  for (const gauge of gauges) {
    // Collect current holders
    for (const address of Object.keys(gauge.current_holders)) {
      allCurrentHolders.add(address.toLowerCase())
    }
    // Collect all users from histories
    for (const address of Object.keys(gauge.user_histories)) {
      allUsers.add(address.toLowerCase())
    }
    // Track latest update
    if (gauge.last_updated && gauge.last_updated > latestUpdate) {
      latestUpdate = gauge.last_updated
    }
  }

  return {
    snapshot_date: latestUpdate || new Date().toISOString(),
    total_gauges: gauges.length,
    total_holders: allCurrentHolders.size,
    total_users: allUsers.size,
  }
}

/**
 * Get metadata - reads from file or computes from gauges
 */
const getMetadata = memoize(
  async (gauges?: GaugeData[]): Promise<HoldersMetadata> => {
    // Try to read from file first
    const fileMetadata = readMetadata()
    if (fileMetadata) {
      return fileMetadata
    }

    // Compute from gauges if no metadata file
    const allGauges = gauges || (await getAllGaugesData())
    return computeMetadataFromGauges(allGauges)
  },
  { maxAge: MEMO_MAX_AGE },
)

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get all pendle gauge holders - main endpoint for /strategies/pendle/holders
 * Returns the combined data from all gauge files
 */
export const getPendleGaugeHoldersData = memoize(
  async () => {
    const gauges = await getAllGaugesData()
    const metadata = await getMetadata(gauges)

    // Build gauges_summary array
    const gaugesSummary = gauges.map((g) => ({
      gauge: g.gauge_id,
      symbol: g.token.symbol,
      current_holders: g.stats.current_holders,
      total_users: g.stats.total_users,
      current_supply: g.stats.current_supply,
    }))

    // Sort by gauge address
    gaugesSummary.sort((a, b) => a.gauge.toLowerCase().localeCompare(b.gauge.toLowerCase()))

    // Calculate average holding duration
    let totalDuration = 0
    let userCount = 0
    for (const gauge of gauges) {
      const histories = Object.values(gauge.user_histories) as UserHistory[]
      for (const userHistory of histories) {
        totalDuration += userHistory.total_holding_duration_days
        userCount++
      }
    }
    const avgHoldingDuration = userCount > 0 ? totalDuration / userCount : 0

    return {
      metadata: {
        snapshot_date: metadata.snapshot_date,
        pendle_locker: '0xD8fa8dC5aDeC503AcC5e026a98F32Ca5C1Fa289A',
        total_gauges: metadata.total_gauges,
        total_current_holders: metadata.total_holders,
        total_unique_users: metadata.total_users,
        average_holding_duration_days: avgHoldingDuration,
        gauges_summary: gaugesSummary,
      },
      gauges: gauges.map((g) => ({
        gauge_id: g.gauge_id,
        vault_id: g.vault_id,
        token: g.token,
        stats: g.stats,
        current_holders: g.current_holders,
        user_histories: g.user_histories,
      })),
    }
  },
  { maxAge: MEMO_MAX_AGE },
)

/**
 * Get single gauge data - for /strategies/pendle/holders/:gaugeId
 */
export const getGaugeData = memoize(
  async (gaugeId: string): Promise<GaugeData | null> => {
    return readGaugeFile(gaugeId)
  },
  { maxAge: MEMO_MAX_AGE },
)

/**
 * Get list of all gauge IDs - for /strategies/pendle/holders/gauges
 */
export const getGaugeIds = memoize(
  async (): Promise<string[]> => {
    return listGaugeFiles()
  },
  { maxAge: MEMO_MAX_AGE },
)

/**
 * Get current holders snapshot - for /strategies/pendle/holders/current
 */
export const getCurrentHoldersSnapshot = memoize(
  async () => {
    const gauges = await getAllGaugesData()
    const metadata = await getMetadata(gauges)

    const holdersSnapshot: Record<
      string,
      {
        gauge: string
        symbol: string
        balance: string
      }[]
    > = {}

    for (const gauge of gauges) {
      const entries = Object.entries(gauge.current_holders) as [string, string][]
      for (const [address, balance] of entries) {
        const lowerAddress = address.toLowerCase()
        if (!holdersSnapshot[lowerAddress]) {
          holdersSnapshot[lowerAddress] = []
        }
        holdersSnapshot[lowerAddress].push({
          gauge: gauge.gauge_id,
          symbol: gauge.token.symbol,
          balance,
        })
      }
    }

    return {
      snapshot_date: metadata.snapshot_date,
      total_holders: Object.keys(holdersSnapshot).length,
      holders: holdersSnapshot,
    }
  },
  { maxAge: MEMO_MAX_AGE },
)

/**
 * Get historical holders data - for /strategies/pendle/holders/historical
 */
export const getHistoricalHoldersData = memoize(
  async (gaugeId?: string, includeEvents = false) => {
    const gauges = await getAllGaugesData()

    // Filter by gauge if specified
    let filteredGauges = gauges
    if (gaugeId) {
      const lowerGaugeId = gaugeId.toLowerCase()
      filteredGauges = gauges.filter((g) => g.gauge_id.toLowerCase() === lowerGaugeId)
    }

    return filteredGauges.map((gauge) => ({
      gauge_id: gauge.gauge_id,
      token: gauge.token,
      stats: gauge.stats,
      user_histories: Object.fromEntries(
        (Object.entries(gauge.user_histories) as [string, UserHistory][]).map(([address, history]) => [
          address,
          includeEvents
            ? history
            : {
                first_seen: history.first_seen,
                last_seen: history.last_seen,
                max_balance: history.max_balance,
                holding_periods: history.holding_periods,
                total_holding_duration: history.total_holding_duration,
                is_current_holder: history.is_current_holder,
                total_holding_duration_days: history.total_holding_duration_days,
              },
        ]),
      ),
    }))
  },
  { maxAge: MEMO_MAX_AGE },
)

/**
 * Get holders for a specific period - for /strategies/pendle/holders/period
 */
export const getHoldersForPeriod = memoize(
  async (startDate: string, endDate: string, gaugeId?: string, minDurationDays?: number) => {
    const startTs = new Date(startDate).getTime() / 1000
    const endTs = new Date(endDate).getTime() / 1000

    const gauges = await getAllGaugesData()

    // Filter by gauge if specified
    let filteredGauges = gauges
    if (gaugeId) {
      const lowerGaugeId = gaugeId.toLowerCase()
      filteredGauges = gauges.filter((g) => g.gauge_id.toLowerCase() === lowerGaugeId)
    }

    const result: Record<
      string,
      {
        gauge: string
        symbol: string
        holding_duration_days: number
        periods: HoldingPeriod[]
      }[]
    > = {}

    for (const gauge of filteredGauges) {
      const userEntries = Object.entries(gauge.user_histories) as [string, UserHistory][]
      for (const [address, history] of userEntries) {
        // Check if user was holding during the period
        const relevantPeriods = history.holding_periods.filter((period) => {
          const periodStart = period.entry_timestamp
          const periodEnd = period.exit_timestamp || Date.now() / 1000
          return periodStart <= endTs && periodEnd >= startTs
        })

        if (relevantPeriods.length === 0) continue

        // Calculate duration within the requested period
        let durationInPeriod = 0
        for (const period of relevantPeriods) {
          const periodStart = Math.max(period.entry_timestamp, startTs)
          const periodEnd = Math.min(period.exit_timestamp || Date.now() / 1000, endTs)
          durationInPeriod += periodEnd - periodStart
        }

        const durationDays = durationInPeriod / 86400

        if (minDurationDays && durationDays < minDurationDays) continue

        const lowerAddress = address.toLowerCase()
        if (!result[lowerAddress]) {
          result[lowerAddress] = []
        }

        result[lowerAddress].push({
          gauge: gauge.gauge_id,
          symbol: gauge.token.symbol,
          holding_duration_days: durationDays,
          periods: relevantPeriods,
        })
      }
    }

    return {
      period: { start: startDate, end: endDate },
      min_duration_days: minDurationDays || 0,
      total_users: Object.keys(result).length,
      users: result,
    }
  },
  { maxAge: MEMO_MAX_AGE },
)

/**
 * Get holder analytics - for /strategies/pendle/holders/analytics
 */
export const getHolderAnalytics = memoize(
  async (gaugeId?: string) => {
    const gauges = await getAllGaugesData()

    // Filter by gauge if specified
    let filteredGauges = gauges
    if (gaugeId) {
      const lowerGaugeId = gaugeId.toLowerCase()
      filteredGauges = gauges.filter((g) => g.gauge_id.toLowerCase() === lowerGaugeId)
    }

    const analytics = filteredGauges.map((gauge) => {
      const histories = Object.values(gauge.user_histories) as UserHistory[]
      const durations = histories.map((h) => h.total_holding_duration_days)
      const maxBalances = histories.map((h) => h.max_balance)

      return {
        gauge_id: gauge.gauge_id,
        token: gauge.token,
        stats: {
          ...gauge.stats,
          avg_holding_duration_days: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
          median_holding_duration_days:
            durations.length > 0 ? durations.sort((a, b) => a - b)[Math.floor(durations.length / 2)] : 0,
          max_holding_duration_days: durations.length > 0 ? Math.max(...durations) : 0,
          avg_max_balance: maxBalances.length > 0 ? maxBalances.reduce((a, b) => a + b, 0) / maxBalances.length : 0,
        },
      }
    })

    return gaugeId && analytics.length === 1 ? analytics[0] : analytics
  },
  { maxAge: MEMO_MAX_AGE },
)

/**
 * Get user history across all gauges - for /strategies/pendle/holders/user/:address
 */
export const getUserHistory = memoize(
  async (address: string) => {
    const gauges = await getAllGaugesData()
    const lowerAddress = address.toLowerCase()

    const userGauges: {
      gauge_id: string
      token: GaugeToken
      history: UserHistory
    }[] = []

    for (const gauge of gauges) {
      // Check both original case and lowercase
      const history = gauge.user_histories[address] || gauge.user_histories[lowerAddress]
      if (history) {
        userGauges.push({
          gauge_id: gauge.gauge_id,
          token: gauge.token,
          history,
        })
      }
    }

    if (userGauges.length === 0) {
      return null
    }

    return {
      address,
      total_gauges: userGauges.length,
      gauges: userGauges,
    }
  },
  { maxAge: MEMO_MAX_AGE },
)
