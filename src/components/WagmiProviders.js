// src/components/WagmiProviders.tsx
'use client'

import { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/config'
const queryClient = new QueryClient()

export default function WagmiProviders({ children }) {
  return (
    <WagmiProvider config={config} >
        <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
    </WagmiProvider>
    
  )
}
