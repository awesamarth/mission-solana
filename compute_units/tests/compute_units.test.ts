import { generateKeyPairSigner } from "@solana/kit";
import { AccountRole, address } from "@solana/kit";
import { describe, it, expect } from "vitest";
import { QuasarSvm, createKeyedSystemAccount } from "@blueshift-gg/quasar-svm/kit";
import { readFile } from "node:fs/promises";

describe.concurrent("ComputeUnits Program", async () => {
  it("initializes", async () => {
    const idl = JSON.parse(await readFile("target/idl/compute_units.json", "utf8")) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/compute_units.so"));

    const payer = await generateKeyPairSigner();

    const initializeInstruction = {
      programAddress,
      accounts: [
        { address: payer.address, role: AccountRole.WRITABLE_SIGNER },
        { address: address("11111111111111111111111111111111"), role: AccountRole.READONLY },
      ],
      data: Uint8Array.from([0]),
    };

    const result = vm.processInstruction(initializeInstruction, [
      createKeyedSystemAccount(payer.address),
    ]);

    console.log("logs:\n" + result.logs.join("\n"));
    console.log("before:", result.preBalances[0]);
    console.log("after:", result.postBalances[0]);
    console.log("diff:", result.preBalances[0] - result.postBalances[0]);

    expect(result.status.ok, `initialize failed:\n${result.logs.join("\n")}`).toBe(true);
    });
});
