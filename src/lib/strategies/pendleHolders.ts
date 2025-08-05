import memoize from 'memoizee'
import { MEMO_MAX_AGE } from '../utils'
import fs from 'fs'
import path from 'path'

// Types for the enhanced Pendle holders structure
export interface HolderBalance {
  user: string
  balance: string
  last_updated: number
}

export interface HoldingPeriod {
  entry_date: string
  exit_date: string | null
  duration_days: number
}

export interface UserHistory {
  user: string
  first_seen_date: string
  last_seen_date: string
  is_current_holder: boolean
  max_balance: string
  total_holding_duration_days: number
  holding_periods: HoldingPeriod[]
}

export interface GaugeStats {
  current_holders: number
  all_time_users: number
  average_holding_duration_days: number
}

export interface GaugeData {
  gauge_id: string
  token: {
    address: string
    symbol: string
  }
  stats: GaugeStats
  user_histories: UserHistory[]
}

export interface PeriodHolder {
  user: string
  holding_duration_days: number
  max_balance_in_period: string
  is_current_holder: boolean
  entry_date: string
  exit_date: string | null
}

export interface GaugePeriodData {
  gauge_id: string
  token: {
    address: string
    symbol: string
  }
  holders_in_period: number
  holders: PeriodHolder[]
}

export interface HoldingDurationDistribution {
  less_than_day: number
  '1_to_7_days': number
  '7_to_30_days': number
  '30_to_90_days': number
  more_than_90_days: number
}

export interface TopHolder {
  user: string
  gauge_id: string
  token: {
    address: string
    symbol: string
  }
  max_balance: string
  total_holding_duration_days: number
  is_current_holder: boolean
}

export interface GaugeAnalytics {
  gauge_id: string
  token: {
    address: string
    symbol: string
  }
  current_holders: number
  all_time_users: number
  average_holding_duration_days: number
  longest_holder: {
    user: string
    duration_days: number
  }
  largest_holder: {
    user: string
    max_balance: string
  }
}

export interface UserGaugeParticipation {
  gauge_id: string
  token: {
    address: string
    symbol: string
  }
  is_current_holder: boolean
  max_balance: string
  total_holding_duration_days: number
  holding_periods: HoldingPeriod[]
  events: Array<{
    type: 'deposit' | 'withdraw'
    amount: string
    datetime: string
  }>
}

// Helper function to read the enhanced index.json
const readPendleHoldersData = async (): Promise<any> => {
  const filePath = path.join('api/strategies/pendle/holders/index.json')
  
  return new Promise((resolve) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${filePath}: ${err}`)
        resolve(null)
        return
      }

      try {
        const jsonData = JSON.parse(data)
        resolve(jsonData)
      } catch (error) {
        console.error(`Error parsing JSON from ${filePath}: ${error}`)
        resolve(null)
      }
    })
  })
}

// Get current holders snapshot
export const getCurrentHoldersSnapshot = memoize(
  async () => {
    const data = await readPendleHoldersData()
    if (!data) return null

    const snapshot = {
      snapshot_date: data.metadata?.snapshot_date || new Date().toISOString(),
      pendle_locker: data.metadata?.pendle_locker || '',
      total_gauges: data.gauges?.length || 0,
      total_current_holders: 0,
      gauges: [] as any[]
    }

    // Process each gauge to get current holders
    for (const gauge of data.gauges || []) {
      const currentHolders = Object.entries(gauge.current_holders || {}).map(([user, info]: [string, any]) => ({
        user,
        balance: info.balance,
        last_updated: info.last_updated
      }))

      snapshot.total_current_holders += currentHolders.length

      // Only include gauges with current holders
      if (currentHolders.length > 0) {
        snapshot.gauges.push({
          gauge_id: gauge.gauge_id,
          token: {
            address: gauge.token?.address || '',
            symbol: gauge.token?.symbol || ''
          },
          current_holders: currentHolders.length,
          current_supply: gauge.stats?.current_supply || '0',
          holders: currentHolders
        })
      }
    }

    return snapshot
  },
  { maxAge: MEMO_MAX_AGE }
)

// Get historical holders data
export const getHistoricalHoldersData = memoize(
  async (filter?: string, includeEvents: boolean = false, isTokenFilter: boolean = false) => {
    const data = await readPendleHoldersData()
    if (!data) return null

    const result = {
      snapshot_date: data.metadata?.snapshot_date || new Date().toISOString(),
      pendle_locker: data.metadata?.pendle_locker || '',
      gauges: [] as GaugeData[]
    }

    // Filter gauges if needed
    const gaugesToProcess = filter 
      ? data.gauges?.filter((g: any) => 
          isTokenFilter 
            ? g.token?.address?.toLowerCase() === filter.toLowerCase()
            : g.gauge_id.toLowerCase() === filter.toLowerCase()
        )
      : data.gauges

    // Process each gauge
    for (const gauge of gaugesToProcess || []) {
      const userHistories: UserHistory[] = []
      
      // Process user histories
      for (const [user, history] of Object.entries(gauge.user_histories || {})) {
        const userHistory = history as any
        
        const processedHistory: UserHistory = {
          user,
          first_seen_date: userHistory.first_seen_date || '',
          last_seen_date: userHistory.last_seen_date || '',
          is_current_holder: userHistory.is_current_holder || false,
          max_balance: userHistory.max_balance || '0',
          total_holding_duration_days: userHistory.total_holding_duration_days || 0,
          holding_periods: userHistory.holding_periods?.map((period: any) => ({
            entry_date: period.entry_date || '',
            exit_date: period.exit_date || null,
            duration_days: period.duration_days || 0
          })) || []
        }

        // Include events if requested
        if (includeEvents && userHistory.events) {
          (processedHistory as any).events = userHistory.events
        }

        userHistories.push(processedHistory)
      }

      result.gauges.push({
        gauge_id: gauge.gauge_id,
        token: {
          address: gauge.token?.address || '',
          symbol: gauge.token?.symbol || ''
        },
        stats: {
          current_holders: gauge.stats?.current_holders || 0,
          all_time_users: gauge.stats?.total_users || 0,
          average_holding_duration_days: 
            userHistories.reduce((sum, u) => sum + u.total_holding_duration_days, 0) / 
            (userHistories.length || 1)
        },
        user_histories: userHistories
      })
    }

    return result
  },
  { maxAge: MEMO_MAX_AGE }
)

// Get holders for a specific period
export const getHoldersForPeriod = memoize(
  async (startDate: string, endDate: string, filter?: string, minDurationDays?: number, isTokenFilter: boolean = false) => {
    const data = await readPendleHoldersData()
    if (!data) return null

    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()

    const result = {
      period: {
        start: startDate,
        end: endDate
      },
      gauges: [] as GaugePeriodData[]
    }

    // Filter gauges if needed
    const gaugesToProcess = filter 
      ? data.gauges?.filter((g: any) => 
          isTokenFilter 
            ? g.token?.address?.toLowerCase() === filter.toLowerCase()
            : g.gauge_id.toLowerCase() === filter.toLowerCase()
        )
      : data.gauges

    // Process each gauge
    for (const gauge of gaugesToProcess || []) {
      const periodHolders: PeriodHolder[] = []

      // Check each user's history
      for (const [user, history] of Object.entries(gauge.user_histories || {})) {
        const userHistory = history as any

        // Check if user was holding during the period
        for (const period of userHistory.holding_periods || []) {
          const entryTime = new Date(period.entry_date).getTime()
          const exitTime = period.exit_date ? new Date(period.exit_date).getTime() : Date.now()

          // Check if holding period overlaps with requested period
          if (entryTime <= end && exitTime >= start) {
            const effectiveStart = Math.max(entryTime, start)
            const effectiveEnd = Math.min(exitTime, end)
            const durationDays = (effectiveEnd - effectiveStart) / (1000 * 60 * 60 * 24)

            // Apply minimum duration filter if specified
            if (!minDurationDays || durationDays >= minDurationDays) {
              periodHolders.push({
                user,
                holding_duration_days: durationDays,
                max_balance_in_period: userHistory.max_balance || '0',
                is_current_holder: userHistory.is_current_holder || false,
                entry_date: period.entry_date,
                exit_date: period.exit_date
              })
              break // Only count user once per gauge
            }
          }
        }
      }

      if (periodHolders.length > 0 || !filter) {
        // Only include gauges with holders in the period
        if (periodHolders.length > 0) {
          result.gauges.push({
            gauge_id: gauge.gauge_id,
            token: {
              address: gauge.token?.address || '',
              symbol: gauge.token?.symbol || ''
            },
            holders_in_period: periodHolders.length,
            holders: periodHolders
          })
        }
      }
    }

    return result
  },
  { maxAge: MEMO_MAX_AGE }
)

// Get holder analytics
export const getHolderAnalytics = memoize(
  async (filter?: string, isTokenFilter: boolean = false) => {
    const data = await readPendleHoldersData()
    if (!data) return null

    const allUserStats = new Map<string, any>()
    const holdingDurationDistribution: HoldingDurationDistribution = {
      less_than_day: 0,
      '1_to_7_days': 0,
      '7_to_30_days': 0,
      '30_to_90_days': 0,
      more_than_90_days: 0
    }

    const gaugeAnalytics: GaugeAnalytics[] = []

    // Filter gauges if needed
    const gaugesToProcess = filter 
      ? data.gauges?.filter((g: any) => 
          isTokenFilter 
            ? g.token?.address?.toLowerCase() === filter.toLowerCase()
            : g.gauge_id.toLowerCase() === filter.toLowerCase()
        )
      : data.gauges

    // Process each gauge
    for (const gauge of gaugesToProcess || []) {
      let longestDuration = 0
      let longestHolder = ''
      let largestBalance = '0'
      let largestHolder = ''
      const durations: number[] = []

      // Process user histories
      for (const [user, history] of Object.entries(gauge.user_histories || {})) {
        const userHistory = history as any
        const duration = userHistory.total_holding_duration_days || 0
        
        durations.push(duration)

        // Update distribution
        if (duration < 1) holdingDurationDistribution.less_than_day++
        else if (duration <= 7) holdingDurationDistribution['1_to_7_days']++
        else if (duration <= 30) holdingDurationDistribution['7_to_30_days']++
        else if (duration <= 90) holdingDurationDistribution['30_to_90_days']++
        else holdingDurationDistribution.more_than_90_days++

        // Track longest holder
        if (duration > longestDuration) {
          longestDuration = duration
          longestHolder = user
        }

        // Track largest holder
        if (BigInt(userHistory.max_balance || '0') > BigInt(largestBalance)) {
          largestBalance = userHistory.max_balance
          largestHolder = user
        }

        // Update user stats across all gauges
        if (!allUserStats.has(user)) {
          allUserStats.set(user, {
            user,
            gauges: [],
            totalDuration: 0,
            maxBalance: '0',
            isCurrentHolder: false
          })
        }

        const userStats = allUserStats.get(user)
        userStats.gauges.push({
          gauge_id: gauge.gauge_id,
          token_address: gauge.token?.address || '',
          token_symbol: gauge.token?.symbol || '',
          duration: duration,
          balance: userHistory.max_balance
        })
        userStats.totalDuration += duration
        if (BigInt(userHistory.max_balance || '0') > BigInt(userStats.maxBalance)) {
          userStats.maxBalance = userHistory.max_balance
        }
        if (userHistory.is_current_holder) {
          userStats.isCurrentHolder = true
        }
      }

      const avgDuration = durations.length > 0 
        ? durations.reduce((a, b) => a + b, 0) / durations.length 
        : 0

      // Only include gauges with users
      const currentHolders = gauge.stats?.current_holders || 0
      const allTimeUsers = gauge.stats?.total_users || 0
      
      if (allTimeUsers > 0) {
        gaugeAnalytics.push({
          gauge_id: gauge.gauge_id,
          token: {
            address: gauge.token?.address || '',
            symbol: gauge.token?.symbol || ''
          },
          current_holders: currentHolders,
          all_time_users: allTimeUsers,
          average_holding_duration_days: avgDuration,
          longest_holder: {
            user: longestHolder,
            duration_days: longestDuration
          },
          largest_holder: {
            user: largestHolder,
            max_balance: largestBalance
          }
        })
      }
    }

    // Get top holders across all gauges
    const topHolders: TopHolder[] = Array.from(allUserStats.values())
      .sort((a, b) => b.totalDuration - a.totalDuration)
      .slice(0, 20)
      .map(stats => ({
        user: stats.user,
        gauge_id: stats.gauges[0].gauge_id, // Primary gauge
        token: {
          address: stats.gauges[0].token_address,
          symbol: stats.gauges[0].token_symbol
        },
        max_balance: stats.maxBalance,
        total_holding_duration_days: stats.totalDuration,
        is_current_holder: stats.isCurrentHolder
      }))

    return {
      snapshot_date: data.metadata?.snapshot_date || new Date().toISOString(),
      summary: {
        total_gauges: data.metadata?.total_gauges || 0,
        total_current_holders: data.metadata?.total_current_holders || 0,
        all_time_unique_users: data.metadata?.total_unique_users || 0,
        average_holding_duration_days: data.metadata?.average_holding_duration_days || 0
      },
      holding_duration_distribution: holdingDurationDistribution,
      top_holders: topHolders,
      gauge_analytics: gaugeAnalytics
    }
  },
  { maxAge: MEMO_MAX_AGE }
)

// Get user history across all gauges
export const getUserHistory = memoize(
  async (userAddress: string) => {
    const data = await readPendleHoldersData()
    if (!data) return null

    const userGauges: UserGaugeParticipation[] = []
    let totalDuration = 0
    let isCurrentHolder = false

    // Search for user in all gauges
    for (const gauge of data.gauges || []) {
      const userHistory = gauge.user_histories?.[userAddress]
      
      if (userHistory) {
        totalDuration += userHistory.total_holding_duration_days || 0
        if (userHistory.is_current_holder) {
          isCurrentHolder = true
        }

        userGauges.push({
          gauge_id: gauge.gauge_id,
          token: {
            address: gauge.token?.address || '',
            symbol: gauge.token?.symbol || ''
          },
          is_current_holder: userHistory.is_current_holder || false,
          max_balance: userHistory.max_balance || '0',
          total_holding_duration_days: userHistory.total_holding_duration_days || 0,
          holding_periods: userHistory.holding_periods?.map((period: any) => ({
            entry_date: period.entry_date || '',
            exit_date: period.exit_date || null,
            duration_days: period.duration_days || 0
          })) || [],
          events: userHistory.events?.map((event: any) => ({
            type: event.type.toLowerCase(),
            amount: event.amount,
            datetime: event.datetime
          })) || []
        })
      }
    }

    if (userGauges.length === 0) {
      return null
    }

    return {
      user: userAddress,
      summary: {
        total_gauges_participated: userGauges.length,
        is_current_holder: isCurrentHolder,
        total_holding_duration_days: totalDuration
      },
      gauge_participations: userGauges
    }
  },
  { maxAge: MEMO_MAX_AGE }
)

// Get gauge summary (lightweight)
export const getGaugeSummary = memoize(
  async () => {
    const data = await readPendleHoldersData()
    if (!data) return null

    // Filter out gauges with zero holders
    const gaugesWithHolders = (data.metadata?.gauges_summary || [])
      .filter((g: any) => g.current_holders > 0 || g.total_users > 0)
      .map((g: any) => ({
        gauge: g.gauge,
        symbol: g.symbol,
        current_holders: g.current_holders,
        all_time_users: g.total_users,
        current_supply: g.current_supply
      }))

    return {
      snapshot_date: data.metadata?.snapshot_date || new Date().toISOString(),
      pendle_locker: data.metadata?.pendle_locker || '',
      total_gauges: data.metadata?.total_gauges || 0,
      total_current_holders: data.metadata?.total_current_holders || 0,
      all_time_unique_users: data.metadata?.total_unique_users || 0,
      average_holding_duration_days: data.metadata?.average_holding_duration_days || 0,
      gauges: gaugesWithHolders
    }
  },
  { maxAge: MEMO_MAX_AGE }
)