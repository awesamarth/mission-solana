import { generateKeyPairSigner } from "@solana/kit";
import { address } from "@solana/kit";
import { describe, it, expect } from "vitest";
import {
  QuasarSvm,
  createKeyedSystemAccount,
} from "@blueshift-gg/quasar-svm/kit";
import { readFile } from "node:fs/promises";
import {
  TryRustClient,
  PROGRAM_ERRORS,
} from "../target/client/typescript/try_rust/kit";

describe.concurrent("TryRust Program", async () => {
  it("initializes", async () => {
    const idl = JSON.parse(
      await readFile("target/idl/try_rust.json", "utf8"),
    ) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/try_rust.so"));

    const client = new TryRustClient();

    const payer = await generateKeyPairSigner();

    const result = vm.processInstruction(
      client.createInitializeInstruction({
        payer: payer.address,
        systemProgram: address("11111111111111111111111111111111"),
        key: "name",
        value: "Bob",
      }),
      [createKeyedSystemAccount(payer.address)],
    );

    expect(
      result.status.ok,
      `initialize failed:\n${result.logs.join("\n")}`,
    ).toBe(true);
    expect(result.logs.join("\n")).toContain("My name is Bob");
  });

  it("checks age", async () => {
    const idl = JSON.parse(
      await readFile("target/idl/try_rust.json", "utf8"),
    ) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/try_rust.so"));

    const client = new TryRustClient();

    const payer = await generateKeyPairSigner();
    const result = vm.processInstruction(
      client.createAgeCheckerInstruction({
        payer: payer.address,
        systemProgram: address("11111111111111111111111111111111"),
        age: 21n,
      }),
      [createKeyedSystemAccount(payer.address)],
    );
    console.log("just testing if this works the way it should")
    expect(result.status.ok, result.logs.join("\n")).toBe(true);
    expect(result.logs.join("\n")).toContain("you are an adult");
  });

  it("filters even numbers", async () => {
    const idl = JSON.parse(
      await readFile("target/idl/try_rust.json", "utf8"),
    ) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/try_rust.so"));

    const payer = await generateKeyPairSigner();
    const client = new TryRustClient();

    const result = vm.processInstruction(
      client.createFilterEvensInstruction({
        payer: payer.address,
        systemProgram: address("11111111111111111111111111111111"),
        nums: [1n, 2n, 3n, 4n, 5n, 6n],
      }),
      [createKeyedSystemAccount(payer.address)],
    );

    expect(result.status.ok, result.logs.join("\n")).toBe(true);
    expect(result.logs.join("\n")).toContain("evens: 2 4 6");
  });
});
