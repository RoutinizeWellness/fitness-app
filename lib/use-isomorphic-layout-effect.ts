"use client"

import { useEffect, useLayoutEffect } from 'react'

// This hook is a safe version of useLayoutEffect that falls back to useEffect during SSR
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export default useIsomorphicLayoutEffect
