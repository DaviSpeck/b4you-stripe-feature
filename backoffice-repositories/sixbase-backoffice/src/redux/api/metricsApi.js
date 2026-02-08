import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const TOKEN_KEY = 'accessToken'

export const metricsApi = createApi({
  reducerPath: 'metricsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_BASE_URL || "https://api-backoffice.b4you.com.br"}/api`,
    prepareHeaders: headers => {
      const tokenString = localStorage.getItem(TOKEN_KEY)
      if (tokenString) {
        const token = JSON.parse(tokenString)
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    }
  }),
  endpoints: builder => ({
    getOverview: builder.query({ query: days => `metrics/active?days=${days}` }),
    getNewProducts: builder.query({ query: days => `metrics/new?days=${days}` }),
    getRanking: builder.query({
      query: ({ threshold, startDate, endDate, page, size }) => ({
        url: '/metrics/ranking',
        params: { threshold, startDate, endDate, page, size }
      })
    }),
    getProducerIntervals: builder.query({ query: () => `metrics/producers/intervals` }),

    getProducersPaused: builder.query({
      query: ({ prevStart, prevEnd, currStart, currEnd, page, size }) => ({
        url: '/metrics/producers/paused',
        params: { prevStart, prevEnd, currStart, currEnd, page, size }
      })
    }),

    getProducersComparative: builder.query({
      query: ({ threshold, prevStart, prevEnd, currStart, currEnd, page, size }) => ({
        url: '/metrics/producers/comparative',
        params: { threshold, prevStart, prevEnd, currStart, currEnd, page, size }
      })
    }),
    getProducersPerformanceDrop: builder.query({
      query: ({ prevStart, prevEnd, currStart, currEnd, dropPct, page, size }) => ({
        url: '/metrics/producers/performance-drop',
        params: { prevStart, prevEnd, currStart, currEnd, dropPct, page, size }
      })
    }),

    getReactivationProducers: builder.query({
      query: ({ page, size, name, email, status }) => ({
        url: '/users/reactivation/producers',
        params: { page, size, name, email, status }
      })
    }),
    updateReactivationStatus: builder.mutation({
      query: ({ uuid, status }) => ({
        url: `/users/reactivation/producers/${uuid}`,
        method: 'PATCH',
        body: { status }
      })
    })
  })
})

export const {
  useGetOverviewQuery,
  useGetNewProductsQuery,
  useGetRankingQuery,
  useLazyGetRankingQuery,
  useGetProducerIntervalsQuery,
  useGetProducersPausedQuery,
  useLazyGetProducersPausedQuery,
  useGetProducersComparativeQuery,
  useLazyGetProducersComparativeQuery,
  useGetProducersPerformanceDropQuery,
  useLazyGetProducersPerformanceDropQuery,
  useGetReactivationProducersQuery,
  useUpdateReactivationStatusMutation
} = metricsApi