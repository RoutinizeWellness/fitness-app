"use client"

import { useEffect, useLayoutEffect } from 'react'

/**
 * A safe version of useLayoutEffect that falls back to useEffect during SSR
 * This avoids the React hydration warning about useLayoutEffect doing nothing on the server
 */
const useSafeLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export default useSafeLayoutEffect
