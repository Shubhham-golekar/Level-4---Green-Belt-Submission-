# SoroFund: Decentralized Soroban Crowdfunding

![SoroFund Dashboard](<img width="1892" height="899" alt="Screenshot 2026-03-19 133307" src="https://github.com/user-attachments/assets/4c031848-6028-458b-a60a-23266988ca1f" />
)

[![Soroban dApp CI/CD](https://github.com/Shubhham-golekar/Level-4---Green-Belt-Submission-/actions/workflows/ci.yml/badge.svg)](https://github.com/Shubhham-golekar/Level-4---Green-Belt-Submission-/actions)

SoroFund is a production-ready decentralized crowdfunding platform built on Stellar's Soroban platform. It features custom token creation and an inter-contract crowdfund logic.

## 🚀 Live Demo
**Project URL:** [https://dist-delta-six-38.vercel.app](https://dist-delta-six-38.vercel.app)

## 📱 Mobile Responsiveness
Our UI is fully optimized for all screen sizes, from desktop to mobile viewports.

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
