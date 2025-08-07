import { http, createConfig } from '@wagmi/core'
import {bsc, bscTestnet, sepolia } from '@wagmi/core/chains'
import { defineChain } from 'viem'
import dotenv from 'dotenv'
import { defaultId } from './utils/constants.ts'
dotenv.config()

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || defaultId

export const config = createConfig({
  chains: [bsc, bscTestnet, sepolia],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
    [sepolia.id]: http(),
  },
  projectId: projectId,
})