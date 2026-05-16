import { generateKeyPairSigner } from "@solana/kit";
import { AccountRole, address } from "@solana/kit";
import { describe, it, expect } from "vitest";
import { QuasarSvm, createKeyedSystemAccount } from "@blueshift-gg/quasar-svm/kit";
import { readFile } from "node:fs/promises";
import { Day3Client } from "../target/client/typescript/day_3/kit";


describe.concurrent("Day3 Program", async () => {

  it("initializes", async () => {
    const idl = JSON.parse(await readFile("target/idl/day_3.json", "utf8")) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/day_3.so"));

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

    expect(result.status.ok, `initialize failed:\n${result.logs.join("\n")}`).toBe(true);
    });

  it("Calls boaty mcboatface", async () => {
    const idl = JSON.parse(await readFile("target/idl/day_3.json", "utf8")) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/day_3.so"));

    const payer = await generateKeyPairSigner();

    const boatyInstruction = {
      programAddress,
      accounts: [
        { address: payer.address, role: AccountRole.WRITABLE_SIGNER },
        { address: address("11111111111111111111111111111111"), role: AccountRole.READONLY },
      ],
      data: Uint8Array.from([0]),
    };

    const result = vm.processInstruction(boatyInstruction, [
      createKeyedSystemAccount(payer.address),
    ]);

    expect(result.status.ok, `boaty failed:\n${result.logs.join("\n")}`).toBe(true);
  });

  it("should add two numbers", async () => {
    const idl = JSON.parse(await readFile("target/idl/day_3.json", "utf8")) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/day_3.so"));

    const payer = await generateKeyPairSigner();

    const client = new Day3Client();
    const addInstruction = client.createAddInstruction({
      payer: payer.address,
      systemProgram: address("11111111111111111111111111111111"),
      a: 7n,
      b:8n,
    })

    const result = vm.processInstruction(addInstruction, [
      createKeyedSystemAccount(payer.address),
    ]);
    console.log("ye dekh result: ", result)
    expect(result.status.ok, `add failed:\n${result.logs.join("\n")}`).toBe(true);
  });

});
