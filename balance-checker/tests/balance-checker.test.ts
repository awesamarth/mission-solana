import { generateKeyPairSigner, address } from "@solana/kit";
import { describe, it, expect } from "vitest";
import { QuasarSvm, createKeyedSystemAccount } from "@blueshift-gg/quasar-svm/kit";
import { readFile } from "node:fs/promises";
import { BalanceCheckerClient } from "../target/client/typescript/balance_checker/kit";

describe.concurrent("BalanceChecker Program", async () => {
  it("reads an arbitrary account balance", async () => {
    const idl = JSON.parse(await readFile("target/idl/balance_checker.json", "utf8")) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/balance_checker.so"));

    const account = await generateKeyPairSigner();
    const client = new BalanceCheckerClient();

    const readBalanceInstruction = client.createReadBalanceInstruction({
      acct: account.address,
    });

    const result = vm.processInstruction(readBalanceInstruction, [
      createKeyedSystemAccount(account.address),
    ]);

    console.log(result.logs.join("\n"));

    expect(result.status.ok, `read balance failed:\n${result.logs.join("\n")}`).toBe(true);
    expect(result.account(account.address)?.lamports ?? 0n).toBeGreaterThan(0n);
  });
});
