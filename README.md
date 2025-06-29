# Frontend for CrossChain Lending Platform

## Overview

The frontend is a user-friendly web application that allows users to interact with the cross-chain lending platform. Users can lock their ETH on Ethereum and borrow USDT on Avalanche seamlessly through the interface.

## Key Features

- **Wallet Connection & Management:**  
  Uses **wagmi** library for easy Ethereum-compatible wallet connection (MetaMask, WalletConnect, etc.).

- **EVM Chain Interaction:**  
  Built on **Next.js**, the frontend communicates directly with smart contracts on Ethereum and Avalanche chains using wagmi hooks and providers.

- **User Actions:**  
  - Lock ETH as collateral on Ethereum chain.  
  - View borrowing limits based on collateral and current LTV.  
  - Borrow USDT on Avalanche chain instantly after collateral lock.  
  - Repay loans and unlock ETH collateral.  
  - See real-time data and transaction status updates.

## Tech Stack

- **Next.js:**  
  React framework for building fast, SEO-friendly web applications.


- **wagmi:**  
  React hooks library for connecting to EVM-compatible wallets and blockchain interactions.

## How it works

1. User connects their wallet via wagmi-supported providers.
2. Frontend sends transactions to Ethereum contracts to lock ETH.
3. Shows borrowing power and allows borrowing USDT on Avalanche.
4. Tracks transaction confirmations and loan status in real-time.
5. Provides intuitive UI for loan management and repayments.

---

The frontend provides a smooth, secure, and transparent experience for users to leverage cross-chain lending capabilities.

SCREENSHOTS:


![3](https://github.com/user-attachments/assets/fc81a8ad-d6d1-46fe-b54e-560900b0620e)
![1](https://github.com/user-attachments/assets/37936b1e-4e16-4ccc-94fd-7fa1a7de48c2)
![5](https://github.com/user-attachments/assets/afb050c9-b63d-4c9b-a923-eaa30476c6f1)
![6](https://github.com/user-attachments/assets/fbcadeb5-0e8d-4a39-a74e-f5bc2a2efc14)
![2](https://github.com/user-attachments/assets/d5d60e2f-6f9f-4358-9363-880ad5fcf1d9)
![4](https://github.com/user-attachments/assets/c7d630d0-46c0-45ac-9d5f-56c93dd01b4d)

