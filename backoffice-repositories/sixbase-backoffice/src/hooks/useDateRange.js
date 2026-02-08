import { useState, useMemo, useCallback } from 'react'
import moment from 'moment'

const DATE_FMT = 'YYYY-MM-DD HH:mm:ss'

export function useDateRange(initialPrev, initialCurr) {
  const [prevRange, setPrevRange] = useState(initialPrev)
  const [currRange, setCurrRange] = useState(initialCurr)

  const formatISO = useCallback(
    ([dStart, dEnd]) => ({
      start: moment(dStart).startOf('day').utc().format(DATE_FMT),
      end: moment(dEnd).endOf('day').utc().format(DATE_FMT)
    }),
    []
  )

  const appliedPrev = useMemo(() => formatISO(prevRange), [prevRange, formatISO])
  const appliedCurr = useMemo(() => formatISO(currRange), [currRange, formatISO])

  const applyRanges = useCallback(() => ({
    prevStart: appliedPrev.start,
    prevEnd: appliedPrev.end,
    currStart: appliedCurr.start,
    currEnd: appliedCurr.end
  }), [appliedPrev, appliedCurr])

  return {
    prevRange,
    currRange,
    setPrevRange,
    setCurrRange,
    applyRanges
  }
}