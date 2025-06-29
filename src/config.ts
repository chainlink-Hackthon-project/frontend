import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

 export const config = createConfig({
  chains: [sepolia],
  ssr: true, 
  transports: {
  [sepolia.id]: http(
    "https://eth-sepolia.g.alchemy.com/v2/RtygtZRvm-k3MjBBKedUf7SYFUllE_JG"

  ),
},
})

