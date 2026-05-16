import { AccountRole, address, generateKeyPairSigner } from "@solana/kit";
import { PROGRAM_ADDRESS } from "../target/client/typescript/day_2/kit";
import { describe, it, run } from "mocha";
import { QuasarSvm, createKeyedSystemAccount } from "@blueshift-gg/quasar-svm/kit";
import { readFile } from "node:fs/promises";
import { assert } from "chai";

function encodeInitializeInstruction({
  payer,
  systemProgram,
  a,
  b,
  message,
}: {
  payer: ReturnType<typeof address>;
  systemProgram: ReturnType<typeof address>;
  a: bigint;
  b: bigint;
  message: string;
}) {
  const messageBytes = new TextEncoder().encode(message);
  if (messageBytes.length > 64) throw new Error("message must be at most 64 bytes");

  const data = new Uint8Array(1 + 8 + 8 + 1 + messageBytes.length);
  const view = new DataView(data.buffer);
  data[0] = 0;
  view.setBigUint64(1, a, true);
  view.setBigUint64(9, b, true);
  data[17] = messageBytes.length;
  data.set(messageBytes, 18);

  return {
    programAddress: PROGRAM_ADDRESS,
    accounts: [
      { address: payer, role: AccountRole.READONLY_SIGNER },
      { address: systemProgram, role: AccountRole.READONLY },
    ],
    data,
  };
}

function encodeArrayInstruction({
  payer,
  systemProgram,
  arr,
}: {
  payer: ReturnType<typeof address>;
  systemProgram: ReturnType<typeof address>;
  arr: bigint[];
}) {
  if (arr.length > 10) throw new Error("arr must contain at most 10 values");

  const data = new Uint8Array(1 + 4 + arr.length * 8);
  const view = new DataView(data.buffer);
  data[0] = 1;
  view.setUint32(1, arr.length, true);
  arr.forEach((value, index) => {
    view.setBigUint64(5 + index * 8, value, true);
  });

  return {
    programAddress: PROGRAM_ADDRESS,
    accounts: [
      { address: payer, role: AccountRole.READONLY_SIGNER },
      { address: systemProgram, role: AccountRole.READONLY },
    ],
    data,
  };
}

function encodeUnderflowInstruction({
  payer,
  systemProgram,
  a,
  b,
}: {
  payer: ReturnType<typeof address>;
  systemProgram: ReturnType<typeof address>;
  a: bigint;
  b: bigint;
}) {
  const data = new Uint8Array(1 + 8 + 8);
  const view = new DataView(data.buffer);
  data[0] = 2;
  view.setBigUint64(1, a, true);
  view.setBigUint64(9, b, true);

  return {
    programAddress: PROGRAM_ADDRESS,
    accounts: [
      { address: payer, role: AccountRole.READONLY_SIGNER },
      { address: systemProgram, role: AccountRole.READONLY },
    ],
    data,
  };
}

describe("Day2 Program", async () => {

  const vm = new QuasarSvm();
  vm.addProgram(PROGRAM_ADDRESS, await readFile("target/deploy/day_2.so"));

  const payer = await generateKeyPairSigner();

  it("initializes", async () => {
    const initializeInstruction = encodeInitializeInstruction({
      payer: payer.address,
      systemProgram: address("11111111111111111111111111111111"),
      a: 10n,
      b: 20n,
      message: "hello",
    });

    const result = vm.processInstruction(initializeInstruction, [
      createKeyedSystemAccount(payer.address),
    ]);

    console.log(result.logs.join("\n"));
    assert.isTrue(result.status.ok, `initialize failed:\n${result.logs.join("\n")}`);
  });

  it("logs an array", async () => {
    const arrayInstruction = encodeArrayInstruction({
      payer: payer.address,
      systemProgram: address("11111111111111111111111111111111"),
      arr: [1n, 2n, 3n],
    });

    const result = vm.processInstruction(arrayInstruction, [
      createKeyedSystemAccount(payer.address),
    ]);

    console.log(result.logs.join("\n"));
    assert.isTrue(result.status.ok, `array failed:\n${result.logs.join("\n")}`);
  });

  it("fails on u64 underflow", async () => {
    const underflowInstruction = encodeUnderflowInstruction({
      payer: payer.address,
      systemProgram: address("11111111111111111111111111111111"),
      a: 0n,
      b: 1n,
    });

    const result = vm.processInstruction(underflowInstruction, [
      createKeyedSystemAccount(payer.address),
    ]);

    console.log(result.logs.join("\n"));
    assert.isFalse(result.status.ok, "underflow should fail with overflow-checks enabled");
  });

  run()
});
