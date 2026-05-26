import { AccountRole, generateKeyPairSigner, address } from "@solana/kit";
import { describe, it, expect } from "vitest";
import { QuasarSvm, createKeyedSystemAccount } from "@blueshift-gg/quasar-svm/kit";
import { readFile } from "node:fs/promises";
import { TransferringClient } from "../target/client/typescript/transferring/kit";

describe.concurrent("Transferring Program", async () => {
  it("sends SOL from signer to recipient", async () => {
    const idl = JSON.parse(await readFile("target/idl/transferring.json", "utf8")) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/transferring.so"));

    const signer = await generateKeyPairSigner();
    const recipient = await generateKeyPairSigner();
    const client = new TransferringClient();
    const amount = 250_000_000n;

    const sendSolInstruction = client.createSendSolInstruction({
      recipient: recipient.address,
      signer: signer.address,
      systemProgram: address("11111111111111111111111111111111"),
      amount,
    });

    const result = vm.processInstruction(sendSolInstruction, [
      createKeyedSystemAccount(signer.address),
      createKeyedSystemAccount(recipient.address, 0n),
    ]);

    expect(result.status.ok, `send_sol failed:\n${result.logs.join("\n")}`).toBe(true);
    expect(result.account(recipient.address)?.lamports).toBe(amount);
  });

  it("splits SOL across remaining accounts", async () => {
    const idl = JSON.parse(await readFile("target/idl/transferring.json", "utf8")) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/transferring.so"));

    const signer = await generateKeyPairSigner();
    const recipient1 = await generateKeyPairSigner();
    const recipient2 = await generateKeyPairSigner();
    const recipient3 = await generateKeyPairSigner();
    const client = new TransferringClient();
    const amount = 900_000_000n;
    const amountEachGets = amount / 3n;

    const splitSolInstruction = client.createSplitSolInstruction({
      signer: signer.address,
      systemProgram: address("11111111111111111111111111111111"),
      amount,
      remainingAccounts: [
        { address: recipient1.address, role: AccountRole.WRITABLE },
        { address: recipient2.address, role: AccountRole.WRITABLE },
        { address: recipient3.address, role: AccountRole.WRITABLE },
      ],
    });

    const result = vm.processInstruction(splitSolInstruction, [
      createKeyedSystemAccount(signer.address),
      createKeyedSystemAccount(recipient1.address, 0n),
      createKeyedSystemAccount(recipient2.address, 0n),
      createKeyedSystemAccount(recipient3.address, 0n),
    ]);

    expect(result.status.ok, `split_sol failed:\n${result.logs.join("\n")}`).toBe(true);
    expect(result.account(recipient1.address)?.lamports).toBe(amountEachGets);
    expect(result.account(recipient2.address)?.lamports).toBe(amountEachGets);
    expect(result.account(recipient3.address)?.lamports).toBe(amountEachGets);
  });
});
