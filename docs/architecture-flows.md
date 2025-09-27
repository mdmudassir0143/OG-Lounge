# 🏗️ Gamie Architecture & Flow Diagrams

This document contains detailed architectural diagrams and flow charts for the Gamie platform.

## 🌐 System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js App Router]
        B[React Components]
        C[Wallet Integration]
        D[AI Interface]
    end
    
    subgraph "API Layer"
        E[Next.js API Routes]
        F[Game Service]
        G[Authentication]
    end
    
    subgraph "External Services"
        H[Google AI/OpenAI]
        I[Pinata IPFS]
        J[Ethereum Network]
    end
    
    subgraph "Data Layer"
        K[MongoDB]
        L[IPFS Storage]
    end
    
    A --> E
    B --> C
    C --> J
    D --> H
    E --> F
    F --> K
    F --> I
    I --> L
    G --> J
```

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant W as Wallet
    participant A as App
    participant E as Ethereum
    
    U->>A: Access Protected Route
    A->>U: Redirect to Auth Layout
    U->>W: Connect Wallet
    W->>E: Request Account Access
    E->>W: Return Account Info
    W->>A: Wallet Connected
    A->>A: Verify Chain (Mainnet/Sepolia)
    A->>U: Grant Access to Protected Features
    
    Note over U,E: User can now create, edit, and manage games
```

## 🎮 Game Creation Flow

```mermaid
flowchart TD
    A[User Clicks Create Game] --> B[Open AI Generator Dialog]
    B --> C[Enter Game Description]
    C --> D[Select Game Type/Template]
    D --> E[AI Generates Code]
    
    E --> F{Code Generated Successfully?}
    F -->|No| G[Show Error Message]
    F -->|Yes| H[Display Generated Code]
    
    G --> C
    H --> I[User Reviews Code]
    I --> J{User Satisfied?}
    J -->|No| K[Refine Prompt]
    J -->|Yes| L[Save to Editor]
    
    K --> E
    L --> M[Upload to IPFS]
    M --> N[Save Metadata to MongoDB]
    N --> O[Game Created Successfully]
    
    O --> P[User Can Edit/Publish]
```

## 🏪 Marketplace Publishing Flow

```mermaid
sequenceDiagram
    participant D as Developer
    participant E as Editor
    participant API as API
    participant IPFS as IPFS
    participant DB as MongoDB
    participant M as Marketplace
    
    D->>E: Click Publish to Marketplace
    E->>API: POST /api/games/publish
    API->>DB: Verify Game Ownership
    DB->>API: Confirm Ownership
    API->>IPFS: Upload Latest Version
    IPFS->>API: Return IPFS CID
    API->>DB: Update Game Status
    DB->>API: Confirm Update
    API->>E: Publish Success
    E->>D: Show Success Message
    
    Note over D,M: Game now visible in marketplace
    M->>DB: Query Published Games
    DB->>M: Return Game List
```

## 🔄 Game Forking Flow

```mermaid
graph TD
    A[User Finds Community Game] --> B[Click Fork Button]
    B --> C[Verify Wallet Connection]
    C --> D{Connected?}
    D -->|No| E[Connect Wallet]
    D -->|Yes| F[Fetch Original Game Data]
    
    E --> F
    F --> G[Create New Game Entry]
    G --> H[Copy Game Code]
    H --> I[Set Original References]
    I --> J[Upload to IPFS]
    J --> K[Save to Database]
    K --> L[Redirect to Editor]
    
    L --> M[User Can Modify Fork]
    M --> N[Publish as New Game]
```

## 💰 Marketplace Purchase Flow

```mermaid
sequenceDiagram
    participant B as Buyer
    participant M as Marketplace
    participant API as API
    participant DB as Database
    participant S as Seller
    
    B->>M: Browse Games
    M->>B: Display Available Games
    B->>M: Click Buy Game
    M->>API: POST /api/games/buy
    API->>DB: Verify Game & Price
    DB->>API: Game Details
    API->>DB: Transfer Ownership
    DB->>API: Update Records
    API->>M: Purchase Success
    M->>B: Confirmation Message
    
    Note over S: Seller receives payment notification
    Note over B: Buyer now owns the game
```

## 🔍 Search & Discovery Flow

```mermaid
flowchart LR
    A[User Enters Search] --> B{Search Type}
    B --> C[Marketplace Search]
    B --> D[Community Search]
    
    C --> E[Query Marketplace Games]
    D --> F[Query Community Games]
    
    E --> G[Filter by Published Status]
    F --> H[Filter by Community Status]
    
    G --> I[Apply Text Search]
    H --> I
    
    I --> J[Sort Results]
    J --> K[Return Paginated Results]
    K --> L[Display to User]
```

## 📊 Data Persistence Architecture

```mermaid
erDiagram
    GAME ||--o{ GAME_VERSION : has
    GAME ||--o{ PUBLICATION : published_as
    GAME }o--|| USER : owned_by
    
    GAME {
        string gameId PK
        string walletAddress FK
        string title
        string description
        array tags
        number currentVersion
        string latestVersionHtml
        string ipfsCid
        string ipfsUrl
        boolean isPublishedToMarketplace
        boolean isPublishedToCommunity
        date marketplacePublishedAt
        date communityPublishedAt
        boolean isForSale
        number salePrice
        string originalGameId
        string originalOwner
        date createdAt
        date updatedAt
    }
    
    GAME_VERSION {
        string versionId PK
        string gameId FK
        number version
        string html
        string title
        string description
        array tags
        string ipfsCid
        string ipfsUrl
        date createdAt
        date updatedAt
    }
    
    PUBLICATION {
        string id PK
        string gameId FK
        number version
        string type
        date publishedAt
        string publishedBy
    }
    
    USER {
        string walletAddress PK
        array ownedGames
        array createdGames
        array purchasedGames
    }
```

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Vercel Platform"
        A[Next.js Application]
        B[API Routes]
        C[Static Assets]
    end
    
    subgraph "External Services"
        D[MongoDB Atlas]
        E[Pinata IPFS]
        F[Google AI API]
        G[OpenAI API]
    end
    
    subgraph "Blockchain"
        H[Ethereum Mainnet]
        I[Sepolia Testnet]
    end
    
    subgraph "Users"
        J[Web Browsers]
        K[Mobile Devices]
    end
    
    J --> A
    K --> A
    A --> B
    B --> D
    B --> E
    B --> F
    B --> G
    A --> H
    A --> I
```

## 🔄 State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Disconnected
    Disconnected --> Connecting : Connect Wallet
    Connecting --> Connected : Wallet Connected
    Connecting --> Disconnected : Connection Failed
    
    Connected --> Authenticated : Chain Verified
    Connected --> WrongNetwork : Wrong Chain
    WrongNetwork --> Connected : Switch Chain
    
    Authenticated --> CreatingGame : Start Creation
    Authenticated --> BrowsingMarketplace : Browse Games
    Authenticated --> ManagingGames : View My Games
    
    CreatingGame --> GeneratingCode : Use AI
    GeneratingCode --> EditingCode : Code Generated
    EditingCode --> SavingGame : Save Game
    SavingGame --> Authenticated : Game Saved
    
    BrowsingMarketplace --> PurchasingGame : Buy Game
    PurchasingGame --> Authenticated : Purchase Complete
    
    ManagingGames --> EditingGame : Edit Game
    EditingGame --> PublishingGame : Publish Game
    PublishingGame --> Authenticated : Game Published
```

## 📱 Component Hierarchy

```mermaid
graph TD
    A[App Layout] --> B[Wallet Provider]
    B --> C[Navbar]
    B --> D[Main Content]
    B --> E[Background]
    
    C --> F[Desktop Nav]
    C --> G[Mobile Nav]
    C --> H[Chain Dropdown]
    C --> I[Connect Button]
    
    D --> J[Public Routes]
    D --> K[Auth Routes]
    
    J --> L[Landing Page]
    J --> M[About Page]
    J --> N[Contact Page]
    
    K --> O[Editor Dashboard]
    K --> P[Game Editor]
    K --> Q[Marketplace]
    K --> R[Community]
    
    P --> S[Code Editor]
    P --> T[Preview Panel]
    P --> U[AI Generator]
    P --> V[Publishing Controls]
```

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph "Frontend Security"
        A[Wallet Signature Verification]
        B[Input Validation]
        C[XSS Protection]
    end
    
    subgraph "API Security"
        D[Request Validation]
        E[Authentication Middleware]
        F[Rate Limiting]
    end
    
    subgraph "Database Security"
        G[MongoDB Encryption]
        H[Access Control]
        I[Data Sanitization]
    end
    
    subgraph "External Security"
        J[IPFS Immutability]
        K[Blockchain Verification]
        L[API Key Management]
    end
    
    A --> D
    B --> D
    D --> E
    E --> H
    F --> D
    G --> H
    J --> K
```

This comprehensive set of diagrams illustrates the complete architecture and flow of the Gamie platform, from user authentication through game creation, publishing, and marketplace interactions.