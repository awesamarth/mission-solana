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
- Program framework: Quasar
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

## Quasar CLI Notes

Quasar should be installed from the GitHub source until a stable release exists:

```bash
cargo install --git https://github.com/blueshift-gg/quasar quasar-cli --force
```

`quasar --version` may still print `0.0.0`; verify source install with `cargo install --list | rg quasar`.

New source-built CLI init flags use the newer split options:

```bash
quasar init day_3 --yes --test-language typescript --ts-sdk kit --toolchain solana --template full
```

Older flags like `--framework quasarsvm-kit` belonged to the earlier/stale CLI interface.

If the user selects Bun interactively, new projects use Bun and Vitest:

- `package.json` has `"type": "module"`
- test script is `vitest run`
- `Quasar.toml` test command is `bun test`
- first `quasar test` may run `bun install`

Fresh source-built scaffolds have been verified to generate current account wrapper fields:

```rust
pub struct Initialize {
    pub payer: Signer,
    pub system_program: Program<SystemProgram>,
}
```

## Legacy Scaffold Caveats

`day_1` and `day_2` were created before reinstalling the GitHub-source CLI and contain local compatibility patches. For new projects such as `day_3`, do not assume these fixes are still needed. If a fresh scaffold fails, check generated files first before applying legacy patches.

`day_3` was created with the source-built CLI using TypeScript + Kit + Bun + minimal template and verified with `quasar test`; it passed using the generated Vitest setup. Treat `day_3+` as the current scaffold style.

For new projects, prefer the generated Quasar TypeScript client when it supports the instruction cleanly:

```ts
import { Day3Client } from "../target/client/typescript/day_3/kit";

const client = new Day3Client();
const ix = client.createAddInstruction({
  payer: payer.address,
  systemProgram: address("11111111111111111111111111111111"),
  a: 7n,
  b: 8n,
});
```

Manual `Uint8Array`/`DataView` instruction encoding is useful for learning or working around generated-client bugs, but do not default to it when `createXInstruction` exists and works.

Quasar instruction names and internal account-method names can differ:

```rust
#[instruction(discriminator = 0)]
pub fn initialize(ctx: Ctx<Initialize>) -> Result<(), ProgramError> {
    ctx.accounts.boaty_mc_boatface()
}
```

This exposes an external instruction named `initialize` with discriminator `0`, even though the internal business logic method is `boaty_mc_boatface`. Rename the `#[instruction]` function itself if the generated client/test should expose a different instruction name.

Known legacy issues from the older scaffold:

- Replace stale account wrapper fields like `&'info mut Signer` and `&'info Program<System>` with current wrapper fields like `Signer` and `Program<SystemProgram>`.
- In `quasarsvm-kit` generated tests, pass `systemProgram: address("11111111111111111111111111111111")` whenever the generated client input requires `systemProgram`.
- Do not rely on `SYSTEM_PROGRAM_ID` from `@blueshift-gg/quasar-svm/kit`; its type declarations may mention it while the runtime export is missing.
- For TypeScript checks with generated Kit clients, use `moduleResolution: "bundler"` and add a local shim if the generated client imports `IInstruction` from `@solana/kit` while the installed Kit version exports `Instruction`.
- Quasar macro `idl-build` cfg warnings are currently non-blocking.
- For heap allocation in Quasar, mark the instruction with `#[instruction(..., heap)]`, enable `default = ["alloc"]` in `Cargo.toml`, and import the needed alloc type such as `use alloc::vec::Vec;`. Do not add `extern crate alloc;` at crate root when a `#[program]` module has any `heap` instruction, because the macro injects it and an explicit import causes duplicate `alloc` errors.

## Quasar Logging Notes

`quasar test` with `quasarsvm-kit` runs in-process through QuasarSVM. It does not send transactions to Surfpool or `solana-test-validator`, so `solana logs` will not show output from those tests. Read logs from the test result instead:

```ts
const result = vm.processInstruction(instruction, accounts);
console.log(result.logs.join("\n"));
```

For simple static on-chain messages, Quasar's prelude exposes `log` as a function:

```rust
log("Hello, world");
```

For logging variable values, use `solana_program_log::Logger` and add the dependency:

```toml
solana-program-log = "1.1.0"
```

```rust
use solana_program_log::Logger;

let mut logger = Logger::<64>::default();
logger.append("You sent ");
logger.append(a);
logger.append(" and ");
logger.append(b);
logger.log();
```

`solana logs` is only useful for transactions sent to a running RPC/validator such as Surfpool after deploying the program there.

Anchor `#[msg("...")]` on errors is replaced in Quasar by `///` doc comments on `#[error_code]` variants; those doc comments become IDL/user-facing error descriptions.
Anchor `err!(MyError::X)` is replaced in Quasar by `Err(MyError::X.into())`, or preferably `require!(condition, MyError::X)` for validations.
