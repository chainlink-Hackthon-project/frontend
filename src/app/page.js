"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/config";
import { WagmiProvider } from "wagmi";
import { SelectUser } from "@/components/SelectUser";


const   queryClient = new QueryClient();

export default function Home() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div>hello ji</div>
        <SelectUser />
        
      </QueryClientProvider>
    </WagmiProvider>
  );
}
