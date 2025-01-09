# Coin Toss Solana

This repository contains a fully functional, feature-rich decentralized application (DApp) built for betting on coin toss events on the Solana blockchain. Users can connect their Solana wallets and place bets using a custom SPL token called Toss Coin. Coin toss events occur every hour, offering frequent opportunities for engagement. This DApp integrates with a Supabase backend for managing off-chain data and leverages Solana smart contracts for on-chain operations.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Details](#api-details)
- [Coin Toss Solana Program](#coin-toss-solana-program)
- [Upgrading Solana Program](#upgrading-solana-program)

---

## Overview

Coin Toss Solana is a betting application that allows users to wager on coin toss events happening every hour. It provides a seamless and intuitive interface for interacting with the Solana blockchain, ensuring a smooth user experience.

### Core Functionalities:
1. Users can connect their Solana wallets and place bets using the Toss Coin token.
2. Coin toss events are automated to occur every hour, managed by a backend API and a Vercel cron job.
3. Features include:
   - **Main Betting Interface**: Place bets directly on the app.
   - **Helpers Page**: For testing, allows interaction with the Solana program.
   - **Vault Page**: View the Toss Coin vault balance and perform tasks like requesting Toss Coin airdrops or depositing into the vault.
4. Backend APIs handle:
   - Settling bets and distributing winnings.
   - Performing coin tosses and creating new events in the Supabase database.

## Features

- **Hourly Coin Toss Events**: Coin toss outcomes are automatically generated, and new events are created for continuous gameplay.
- **Automated APIs**:
  - **Settling Bets API**: Processes bet outcomes, distributes winnings, and updates statuses.
  - **Coin Toss API**: Performs the coin toss and creates the next event, integrated with a Vercel cron job.
- **Full Wallet Integration**: Users can connect Solana wallets to place bets and receive winnings.
- **Comprehensive Frontend Pages**:
  - **Betting Interface**: Easy-to-use interface for placing bets.
  - **Helpers Page**: Perform various interactions with the Solana program (primarily for testing).
  - **Vault Page**: Manage Toss Coin token operations, including airdrops and vault interactions.

## Tech Stack

- **Blockchain**: Solana
- **Backend**: Supabase
- **Frontend**: React, Next.js and Shadcn UI
- **Programming Languages**: TypeScript, Javascript, Tailwind CSS and Rust
- **Libraries/Tools**:
  - `@coral-xyz/anchor`: For interacting with Solana programs.
  - `@solana/web3.js`: For Solana blockchain utilities.
  - `@solana/spl-token`: For SPL token operations.
  - Vercel Cron Jobs: To automate event creation.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.18.0 or higher)
- [pnpm](https://pnpm.io/) (preferred package manager)
- [Rust](https://www.rust-lang.org/) (v1.77.2 or higher)
- [Anchor CLI](https://www.anchor-lang.com/) (v0.30.1 or higher)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) (v1.18.17 or higher)
- Supabase account with configured tables

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/solana-bets-dapp.git
   cd solana-bets-dapp
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables (see [Environment Variables](#environment-variables)).

4. Build the project:
   ```bash
   pnpm build
   ```

5. Run the application:
   ```bash
   pnpm dev
   ```
   
## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
API_KEY=your_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
WALLET_PRIVATE_KEY=your_wallet_private_key
NEXT_PUBLIC_TOSS_COIN=your_spl_token_mint_address
```

## Usage

### Running the Application

1. Connect your Solana wallet to the application.
2. Place bets using Toss Coin tokens on hourly coin toss events.
3. Navigate the app to perform various tasks:
   - **Main Interface**: Place bets and view outcomes.
   - **Helpers Page**: Test various Solana interactions.
   - **Vault Page**: Manage vault-related operations.

### APIs

- **Settling Bets API**: Automates bet settlement and winnings distribution.
- **Coin Toss API**: Automates coin toss events and new event creation.

#### Example Usage of Settling Bets API
```bash
curl -X GET -H "Authorization: Bearer your_api_key" http://localhost:3000/api/settle-bets
```

## API Details

### GET /api/settle-bets

Processes open bets by:
- Checking event results.
- Settling bets on-chain.
- Updating bet statuses in Supabase.

#### Headers
- `Authorization`: Bearer API_KEY

#### Responses
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized

### Example Response
```json
{
  "success": true,
  "dbUpdates": [
    {
      "id": 1,
      "status": "won",
      "settled_at": "2025-01-09T12:00:00Z"
    }
  ]
}
```

### GET /api/coin-toss

Automates coin toss events and creates new events in Supabase.

#### Responses
- `200`: Success
- `500`: Server Error

## Coin Toss Solana Program

This is a Solana program written in Rust using the Anchor framework and includes the following instruction handlers:

1. **Place Bet**: Allows users to place a bet on an event.
2. **Settle Bet**: Handles payouts and updates bet statuses.
3. **Manage Vault**: Handles Toss Coin deposits, withdrawals, and vault balance management.

The program ensures all on-chain operations are secure and efficient.

### Anchor Commands

You can use any normal anchor commands. Either move to the `coin_toss` directory and run the `anchor` command or prefix the command with `pnpm`, eg: `pnpm anchor`.

#### Sync the program ID
This command creates a new keypair in the `coin_toss/target/deploy` directory, saves the address to the Anchor config file, and updates the `declare_id!` macro in the `./src/lib.rs` file of the program. Ensure to manually update the constant in `coin_toss/lib/basic-exports.ts` to match the new program ID.

```bash
pnpm anchor keys sync
```

#### Build the program
```bash
pnpm anchor build
```

#### Start a local validator with the program deployed
```bash
pnpm anchor localnet
```

#### Run tests
```bash
pnpm anchor test
```

#### Deploy to Devnet
```bash
pnpm anchor deploy --provider.cluster devnet
```


## Upgrading Solana Program

### Steps to Upgrade

1. Check the size of the new program build:
   ```bash
   ls -lh target/deploy/<program>.so
   ```

2. Check the size of the deployed program:
   ```bash
   solana program show <PROGRAM_ID>
   ```

3. Extend the size of the deployed program (if required):
   ```bash
   solana program extend <PROGRAM_ID> <BYTES_SIZE>
   ```

4. Upgrade the program on-chain:
   ```bash
   anchor upgrade --provider.cluster <CLUSTER> --program-id <PROGRAM_ID> target/deploy/<PROGRAM>.so
   ```

