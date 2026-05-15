import { address, generateKeyPairSigner } from "@solana/kit";
import { Day1Client, PROGRAM_ADDRESS } from "../target/client/typescript/day_1/kit";
import { describe, it, run } from "mocha";
import { QuasarSvm, createKeyedSystemAccount } from "@blueshift-gg/quasar-svm/kit";
import { readFile } from "node:fs/promises";
import { assert } from "chai";

const Day1Program = new Day1Client();

describe("Day1 Program", async () => {

  const vm = new QuasarSvm();
  vm.addProgram(PROGRAM_ADDRESS, await readFile("target/deploy/day_1.so"));

  const payer = await generateKeyPairSigner();

  it("initializes", async () => {
    const initializeInstruction = Day1Program.createInitializeInstruction({
      payer: payer.address,
      systemProgram: address("11111111111111111111111111111111"),
    });

    const result = vm.processInstruction(initializeInstruction, [
      createKeyedSystemAccount(payer.address),
    ]);

    console.log(result.logs.join("\n"));
    assert.isTrue(result.status.ok, `initialize failed:\n${result.logs.join("\n")}`);
  });

  run()
});
