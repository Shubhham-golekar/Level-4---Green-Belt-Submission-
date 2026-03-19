# SoroFund: Decentralized Soroban Crowdfunding



[![Soroban dApp CI/CD](https://github.com/Shubhham-golekar/Level-4---Green-Belt-Submission-/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/Shubhham-golekar/Level-4---Green-Belt-Submission-/actions)

SoroFund is a production-ready decentralized crowdfunding platform built on Stellar's Soroban platform. It features custom token creation and an inter-contract crowdfund logic.

## 🚀 Live Demo
**Project URL:** [https://dist-delta-six-38.vercel.app](https://dist-delta-six-38.vercel.app)

## Demo Video
**[Video Demo](https://www.loom.com/share/c7f1b03e15a34343a1ef0960f72bf89d)

## 📱 Mobile Responsiveness
![WhatsApp Image 2026-03-19 at 3 46 48 PM](https://github.com/user-attachments/assets/592c2751-c76c-48e2-9a0c-5b900532a7a5)

Our UI is fully optimized for all screen sizes, from desktop to mobile viewports.

## 🛠 CI/CD Pipeline
We use GitHub Actions to automate our testing and build process:
<img width="1888" height="515" alt="Screenshot 2026-03-19 153403" src="https://github.com/user-attachments/assets/eaf55762-fbed-4714-87d0-8f3493ad93ab" />


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
