# coin-toss-solana

## Getting Started

### Prerequisites

- Node v18.18.0 or higher

- Rust v1.77.2 or higher
- Anchor CLI 0.30.1 or higher
- Solana CLI 1.18.17 or higher

### Installation

#### Clone the repo

```shell
git clone <repo-url>
cd <repo-name>
```

#### Install Dependencies

```shell
pnpm install
```

#### Start the web app

```
pnpm dev
```

## Apps

### anchor

This is a Solana program written in Rust using the Anchor framework.

#### Commands

You can use any normal anchor commands. Either move to the `anchor` directory and run the `anchor` command or prefix the command with `pnpm`, eg: `pnpm anchor`.

#### Sync the program id:

Running this command will create a new keypair in the `anchor/target/deploy` directory and save the address to the Anchor config file and update the `declare_id!` macro in the `./src/lib.rs` file of the program.

You will manually need to update the constant in `anchor/lib/basic-exports.ts` to match the new program id.

```shell
pnpm anchor keys sync
```

#### Build the program:

```shell
pnpm anchor-build
```

#### Start the test validator with the program deployed:

```shell
pnpm anchor-localnet
```

#### Run the tests

```shell
pnpm anchor-test
```

#### Deploy to Devnet

```shell
pnpm anchor deploy --provider.cluster devnet
```

### web

This is a React app that uses the Anchor generated client to interact with the Solana program.

#### Commands

Start the web app

```shell
pnpm dev
```

Build the web app

```shell
pnpm build
```

### Upgrading Solana Program

Check the size of the new program build.

```shell
ls -lh target/deploy/<program>.so
```

Check the size of the deployed program.

```shell
solana program show <PROGRAM_ID>
```

Extend the size of the deployed program (if it was less than the size of the new build).

```shell
solana program extend <PROGRAM_ID> <BYTES_SIZE>
```

Upgrade the program on chain.

```shell
anchor upgrade --provider.cluster <CLUSTER> --program-id <PROGRAM_ID> target/deploy/<PROGRAM>.so
```

Can you generate concise, clear but effective JSDoc commenting/code comments/ documentation wherever necessary for the following code. Make sure to follow modern software development best practices for Next js, React, Typescript, Javascript etc.
