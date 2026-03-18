# SoroFund: Decentralized Soroban Crowdfunding

![Mobile Responsive View](/C:/Users/SHUBHAM/.gemini/antigravity/brain/b5498a8e-bc74-404b-9c9f-4f33fd1cc8f0/mobile_responsive_view_1773768011792.png)

[![Soroban dApp CI/CD](https://github.com/shubham-level4/level4/actions/workflows/ci.yml/badge.svg)](https://github.com/shubham-level4/level4/actions)

SoroFund is a production-ready decentralized crowdfunding platform built on Stellar's Soroban platform. It features custom token creation and an inter-contract crowdfund logic.

## 🚀 Live Demo
**Project URL:** [https://dist-delta-six-38.vercel.app](https://dist-delta-six-38.vercel.app)

## 📱 Mobile Responsiveness
Our UI is fully optimized for all screen sizes. See the screenshot above for a view of the campaign dashboard on a mobile viewport.

## 🛠 CI/CD Pipeline
We use GitHub Actions to automate our testing and build process:
- **Contract Tests**: Ensures all Soroban smart contracts pass functional verification.
- **Frontend Build**: Validates the React + Vite + Tailwind CSS build before deployment.

## 📜 Contract Details (Testnet)
| Contract | Address |
| :--- | :--- |
| **Crowdfund Contract** | `CBJ4H2GGOTSFL3TNMMGFZNYDAFGQFNAU3WZCEWLOB5OECBM4QXY4VWY2` |
| **Custom Token (Pool)** | `CC7XGUDLJBPVIKASPQJFQVQI34AVCX2CCY6HSHO2U76TH6GB52PTADCQ` |

### Transaction Hashes
- **Token Deploy Txn**: `362cb5d89987ba239b62f2ee95902439c4caa06e9231b3918b0cd575752bd6c8`
- **Crowdfund Deploy Txn**: `0d58a5f67e375407458006ecdb2b27b853d59118bc38a6cc766ff5c51344ce68`

## 📦 Getting Started

### 1. Smart Contracts
```bash
cd contracts
cargo test
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔒 Security
- **Freighter Integration**: Secure signing via the official Freighter browser extension.
- **Inter-Contract Guard**: Crowdfund contract strictly verifies token transfers via the Soroban Token interface.
