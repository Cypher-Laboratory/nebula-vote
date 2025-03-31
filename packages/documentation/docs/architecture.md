# 🏗️ Technical Architecture

This document outlines the technical architecture of Nebula Vote, explaining how the various components interact to provide privacy-preserving polling on the Starknet blockchain.

## System Overview

Nebula Vote consists of four main components:

1. **User-Facing Bots** (Discord & Telegram)
2. **Backend Service**
3. **Ring Signature Generation System**
4. **Starknet Smart Contracts**

Here's how these components work together:

```
┌─────────────┐    ┌─────────────┐    ┌──────────────────┐    ┌────────────────┐
│ Discord Bot │    │             │    │ Ring Signature   │    │                │
│ Telegram Bot├───►│   Backend   │───►│ Generation       ├───►│ Starknet       │
│             │    │             │    │ System           │    │ Smart Contracts│
└─────────────┘    └─────────────┘    └──────────────────┘    └────────────────┘
       ▲                  ▲                     │                      │
       │                  │                     │                      │
       └──────────────────┴─────────────────────┘                      │
                            Poll Results                               │
                          & Vote Confirmation                          │
                                                                       │
                                  ◄────────────────────────────────────┘
                              On-Chain Verification & Storage
```

## Data Flow Architecture

### 1. Poll Creation & Voting Process

The process begins when a user creates a poll or submits a vote:

1. **User Interaction**: Users interact with the Discord or Telegram bot to create polls or cast votes.

2. **Bot Handling**: The bot receives these commands and forwards the relevant data to the backend service.

3. **Backend Processing**: The backend service:
   - Validates user requests
   - Manages poll state
   - Tracks which users have voted
   - Prevents double-voting

4. **Ring Signature Generation**:
   - When a user votes, the backend generates a ring signature
   - This occurs server-side since private keys cannot be safely stored in Discord/Telegram apps
   - The signature cryptographically proves vote authenticity without revealing the voter's identity

5. **Blockchain Transaction**:
   - The backend broadcasts the ring signature to the Starknet contract
   - Target contract address: TBD (not yet deployed)
   - The smart contract verifies the signature and records the vote

6. **Results Display**:
   - The bots query results from both the backend and the blockchain
   - Users can see real-time vote tallies with privacy guarantees

### 2. Security & Privacy Considerations

The architecture is specifically designed to protect voter privacy:

- **Separation of Concerns**: The bot knows who voted but not what they voted for; the blockchain knows what was voted for but not who voted
- **No Private Key Exposure**: All cryptographic operations happen server-side
- **Double-Vote Prevention**: Without compromising anonymity
- **Verifiable Results**: Anyone can verify the vote count on-chain

## 🖋️ Ring Signatures Explained

### What Are Ring Signatures?

**Ring Signatures** are cryptographic protocols that enable a group of users to sign a message while preserving the anonymity of the actual signer. Unlike traditional digital signatures, ring signatures introduce signer ambiguity, making it unclear which member of the group produced the signature. This ensures that the message could plausibly have been signed by any participant, making it extremely difficult to trace the true author.

Ring signatures enhance privacy by making transactions untraceable. They are widely used in applications such as blockchain-based privacy coins (e.g., Monero) and secure voting systems, where anonymity and security are paramount.

### How Ring Signatures Work in Nebula Vote

1. **Group Formation**:
   - When a user votes, they are placed in a "ring" with other potential voters
   - The larger the ring, the greater the anonymity

2. **Signature Generation**:
   - The backend uses the voter's temporary private key and the public keys of all ring members
   - A complex mathematical process produces a signature that could have come from any ring member
   - Only the actual voter's private key was used, but the verification process cannot determine which one

3. **Verification**:
   - The Starknet smart contract can verify that:
     - The signature is valid (came from a ring member)
     - The vote is legitimate
     - No double-voting has occurred
   - However, it cannot determine which specific member cast the vote

4. **Privacy Guarantees**:
   - Cryptographic guarantee that votes cannot be linked to voters
   - Vote choices remain private even from the poll creator
   - Results are still verifiably accurate

### Ring Signature Applications

In Nebula Vote, ring signatures provide several critical benefits:

- **Voter Privacy**: No one can determine how an individual voted
- **Coercion Resistance**: Users cannot prove how they voted, preventing vote buying or coercion
- **Verifiability**: Despite privacy, votes are verifiably counted correctly
- **Double-Vote Prevention**: The system prevents users from voting multiple times without revealing their identity

## Smart Contract Integration

The Starknet smart contract (address TBD) handles:

1. **Ring Signature Verification**: Verifies the cryptographic proofs
2. **Vote Recording**: Stores votes in a privacy-preserving manner
3. **Result Tabulation**: Maintains accurate vote counts
4. **Data Permanence**: Ensures vote data cannot be altered

This contract will be deployed to Starknet, leveraging its scalability and low gas costs while maintaining security guarantees.

## Technical Stack

- **Bot Frameworks**: Discord.js and Telegraf
- **Backend**: Node.js with TypeScript
- **Database**: SQLite for bot state, with blockchain for permanent storage
- **Cryptography**: Alice's Ring library for ring signature implementation
- **Blockchain**: Starknet contracts written in Cairo

## Future Architecture Enhancements

Planned improvements to the architecture include:

1. **Token-Gated Voting**: Allow polls restricted to token holders without revealing holdings
2. **Multiple Voting Schemes**: Support for various voting methods (ranked choice, quadratic, etc.)
3. **Cross-Platform Identity**: Allow users to be recognized across platforms without compromising privacy
4. **Reward Distribution**: Privacy-preserving distribution of rewards to poll participants

## Security Considerations
None of our work here has been audited, and we are not security experts. We are doing our best to follow best practices and ensure the security of our system. However, we cannot guarantee that our system is free from vulnerabilities. We encourage security researchers to review our code and report any issues they find.

By combining these components, Nebula Vote delivers a privacy-first polling system that maintains the transparency and verifiability benefits of blockchain technology.