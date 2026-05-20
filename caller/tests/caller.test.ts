import { AccountRole, address,generateKeyPairSigner } from "@solana/kit";
import { describe, it, expect } from "vitest";
import { QuasarSvm, createKeyedSystemAccount } from "@blueshift-gg/quasar-svm/kit";
import { readFile } from "node:fs/promises";
import { PROGRAM_ERRORS } from "../target/client/typescript/caller/kit";

const OWNER = address("5yDpyuSofQARocCtzkrHaEeRjSBTuYTPPna1aeZjqUB6");

describe.concurrent("Caller Program", async () => {
  it("initializes", async () => {
    const idl = JSON.parse(await readFile("target/idl/caller.json", "utf8")) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/caller.so"));

    const signer1 = await generateKeyPairSigner();
    const signer2 = await generateKeyPairSigner();

    const initializeInstruction = {
      programAddress,
      accounts: [
        { address: signer1.address, role: AccountRole.READONLY_SIGNER },
        { address: address("11111111111111111111111111111111"), role: AccountRole.READONLY },
        { address: signer2.address, role: AccountRole.READONLY_SIGNER },
      ],
      data: Uint8Array.from([0]),
    };

    const result = vm.processInstruction(initializeInstruction, [
      createKeyedSystemAccount(signer1.address),
      createKeyedSystemAccount(signer2.address),
    ]);

    console.log(result.logs.join("\n"));

    expect(result.status.ok, `initialize failed:\n${result.logs.join("\n")}`).toBe(true);
    });

  it("is called by the owner", async () => {
    const idl = JSON.parse(await readFile("target/idl/caller.json", "utf8")) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/caller.so"));

    const result = vm.processInstruction(
      {
        programAddress,
        accounts: [{ address: OWNER, role: AccountRole.READONLY_SIGNER }],
        data: Uint8Array.from([1]),
      },
      [createKeyedSystemAccount(OWNER)],
    );

    console.log(result.logs.join("\n"));
    expect(result.status.ok, `only owner failed:\n${result.logs.join("\n")}`).toBe(true);
  });

  it("is not called by the owner", async () => {
    const idl = JSON.parse(await readFile("target/idl/caller.json", "utf8")) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/caller.so"));

    const attacker = await generateKeyPairSigner();
    const result = vm.processInstruction(
      {
        programAddress,
        accounts: [{ address: attacker.address, role: AccountRole.READONLY_SIGNER }],
        data: Uint8Array.from([1]),
      },
      [createKeyedSystemAccount(attacker.address)],
    );

    console.log(result.logs.join("\n"));
    expect(result.status.ok).toBe(false);
    if (!result.status.ok) {
      expect(result.status.error.type).toBe("Custom");
      if (result.status.error.type === "Custom") {
        expect(PROGRAM_ERRORS[result.status.error.code]).toEqual({
          name: "NotOwner",
          msg: "Only owner can call this function!",
        });
      }
    }
  });
});
