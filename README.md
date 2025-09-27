````markdown
# 🎮 OG-Lounge – AI-Powered On-Chain Game Platform  

**OG-Lounge** is a revolutionary blockchain-powered platform where anyone can **create, own, and trade AI-generated games** as **iNFTs**. Powered by **OG Blockchain, Pyth Entropy, and IPFS**, OG-Lounge ensures decentralized ownership, provable fairness, and permanent storage.  

## 🌟 Features  

### 🤖 AI-Powered Game Creation  
- **Prompt-to-Game:* Describe your idea → get complete HTML5 game code from AI  
- **Smart Refinement:** Iteratively improve mechanics and assets with Gemini AI  
- **Playable Prototypes:** Games auto-wrapped in a safe HTML5 canvas shell  

### 🔗 Blockchain & Ownership  
- **OG Blockchain Integration:** Fast, EVM-compatible chain for minting iNFTs  
- **Decentralized Ownership:** Every game minted as an **iNFT** 
- **On-Chain Fairness:** **Pyth Entropy** brings verifiable randomness into game logic  
- **Wallet Auth:** Seamless access via **Rainbow Wallet** + Wagmi hooks  

### 🏪 Marketplace & Trading  
- **Game Marketplace:** List, buy, and sell AI-generated iNFT games   
- **Fork & Resell:** Build on existing games and publish new versions  

### 🛠️ Developer & Creator Tools  
- **Monaco Code Editor:** Edit game code directly in the browser  
- **Live Preview:** Test games instantly before minting  
- **Fork & Collaborate:** Remix community games via IPFS-based versioning  
- **One-Click Publishing:** Deploy to marketplace or keep private  

---

## 🏗️ Architecture Overview  

### Frontend Stack  
- **Next.js 15** + **TypeScript**  
- **React 19** + **TailwindCSS** + **Shadcn/ui** for UI/UX  
- **Wagmi** + **Rainbow Wallet** for Web3 authentication  

### Blockchain & Web3  
- **OG Blockchain** for iNFTs & marketplace contracts  
- **Pyth Entropy** for on-chain randomness  
- **Beam** serverless functions to orchestrate AI + contract calls  

### AI & Game Generation  
- **Google Gemini API** for text-to-code & asset generation  
- **Prompt Templates** ensure valid, playable outputs  

### Backend & Storage  
- **MongoDB** for game metadata, indexing, and off-chain analytics  
- **IPFS (Pinata)** for decentralized and permanent asset storage  


## 🚀 Getting Started  

### Prerequisites  
- **Node.js** 18+  
- **pnpm** package manager  
- **MongoDB** instance  
- **Pinata IPFS** account  
- **Google Gemini API Key**  
- **OG Blockchain Wallet** (Rainbow recommended)  

### Installation  

```bash
git clone https://github.com/your-org/og-lounge.git
cd og-lounge
pnpm install
````

Add environment variables in `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/og-lounge
GOOGLE_GENAI_API_KEY=your_gemini_api_key
PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Run development server:

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 🔄 Application Flow

```mermaid
    A[User Connects Wallet] --> B{Authenticated?}
    B -->|Yes| C[Dashboard]
    B -->|No| D[Connect Rainbow Wallet]
    
    C --> E[Choose Action]
    E --> F[Generate New Game]
    E --> G[Marketplace]
    E --> H[My Games]
    
    F --> I[Gemini AI Generator]
    I --> J[Playable Game Code]
    J --> K[Pin to IPFS]
    K --> L[Mint iNFT on OG]
    
    L --> M[Marketplace Listing]
    M --> N[Buy/Sell/Trade]
    
    G --> O[Browse iNFT Games]
    O --> P[Purchase or Fork]
    P --> Q[Own/Forked iNFT]
```

---

## 🗄️ Database Schema

### Games Collection

```ts
type Game = {
  _id?: string;
  gameId: string;
  owner: string;              // Wallet address
  title: string;
  description?: string;
  tags?: string[];
  ipfsCid: string;
  ipfsUrl: string;
  isForSale?: boolean;
  price?: number;
  createdAt: Date;
  updatedAt: Date;
};
```

# Contract Deployment Details

- **Contract Address:** `0xc4eb35F9FD6C69ce1169e900ebf4862aD7444D1B`  
- **Pyth Oracle:** `0xDd24F84d36BF92C65F92307595335bdFab5Bbd21`  
- **Network:** Sepolia  
- **Chain ID:** 11155111  
- **Deployer:** `0x94455e0b14e287DC23175107974bC84A49dF4045`  
- **Transaction Hash:** [`0xa90dff1055abbfd54e80bb6c3fc4dbaec27bbc84ce9683c9a9844d6cfaf3cca2`](https://sepolia.etherscan.io/tx/0xa90dff1055abbfd54e80bb6c3fc4dbaec27bbc84ce9683c9a9844d6cfaf3cca2) 

## 📄 License

MIT [LICENSE](LICENSE)


## 🙏 Acknowledgments

* **OG Blockchain** for powering ownership
* **Pyth Network** for on-chain randomness
* **Pinata/IPFS** for storage
* **Gemini AI** for game generation
* **Rainbow Wallet** for user onboarding

---

**Made with ⚡ on-chain by the OG-Lounge Team**

```