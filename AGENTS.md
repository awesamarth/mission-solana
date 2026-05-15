# AGENTS.md

## Mission

This directory is for learning modern Solana deeply and practically. The goal is to build working knowledge across Solana frontend, transaction construction, wallet UX, and program development using current tooling instead of legacy `@solana/web3.js`-first patterns.

## Local Reference Files

Large documentation dumps are stored in `reference-dumps/`. Do not read these files end to end. Use targeted searches with `rg` and then read only the relevant nearby lines.

- `reference-dumps/solana-kit.txt`: Large Solana Kit documentation dump.
- `reference-dumps/quasar.txt`: Large Quasar documentation dump.
- `reference-dumps/connectors.txt`: Small Connector Kit reference dump.

Recommended workflow:

```bash
rg -n "search term" reference-dumps/solana-kit.txt
sed -n 'START,ENDp' reference-dumps/solana-kit.txt
```

## Current Stack Decision

Use a modern Kit-native Solana stack:

- Wallet connection and wallet UI foundation: `@solana/connector`
- Core client, transaction, signer, and RPC layer: `@solana/kit`
- Program framework: Quasar, now switching to Anchor
- Program-specific TypeScript client: Quasar-generated `target/client/typescript/<program>/kit.ts`

Avoid starting with Gill or Kite by default. They can be added later as optional convenience layers, but the initial learning path should keep the stack closer to Solana Kit and Quasar-generated clients.

## Mental Model

Solana frontend layers:

- `@solana/connector`: wallet discovery, connection state, Wallet Standard support, wallet signing UX, render-prop elements, and composable wallet UI primitives.
- `@solana/kit`: viem-like base layer for addresses, RPC, transaction messages, signers, simulation, sending, and confirmation.
- Quasar IDL: ABI-like description of a program's instructions, accounts, types, events, and errors.
- Quasar-generated `kit.ts`: typed instruction builders, account decoders, event parsers, and PDA helpers for the specific Quasar program.

Quasar's generated `kit.ts` does not replace `@solana/kit`. It replaces hand-written program instruction encoding for custom Quasar programs.

## Connector Kit Notes

Connector Kit is headless and composable, not a fully opinionated RainbowKit clone. It provides:

- `AppProvider`
- `useConnector`
- Wallet Standard wallet detection
- Mobile Wallet Adapter support
- auto-connect
- network switching
- transaction signer support
- render-prop elements such as `BalanceElement`, `ClusterElement`, `TokenListElement`, `TransactionHistoryElement`, and `DisconnectElement`

Complete UI components such as `ConnectButton`, `WalletModal`, and `WalletDropdownContent` are best treated as copy/customize examples using Radix UI, Base UI, shadcn/ui, and local styling.

## Learning Direction

Prioritize understanding these concepts in order:

1. Accounts, programs, instructions, transactions, signers, and PDAs.
2. `@solana/kit` primitives for building, signing, sending, and confirming transactions.
3. Wallet Standard and Connector Kit for wallet UX.
4. Quasar program structure: `#[program]`, `#[derive(Accounts)]`, `#[account]`, constraints, instructions, and zero-copy accounts.
5. Quasar IDL and generated `kit.ts` clients.
6. Full app loop: connect wallet, build instruction, create transaction message, sign/send, confirm, read/decode account state, decode errors/events.
7. SPL tokens, ATAs, Token-2022, CPI, and program testing.
