import { generateKeyPairSigner } from "@solana/kit";
import { AccountRole, address } from "@solana/kit";
import { describe, it, expect } from "vitest";
import { QuasarSvm, createKeyedSystemAccount } from "@blueshift-gg/quasar-svm/kit";
import { readFile } from "node:fs/promises";
import { Day4Client, PROGRAM_ERRORS } from "../target/client/typescript/day_4/kit";

describe.concurrent("Day4 Program", async () => {
  it("initializes", async () => {
    const idl = JSON.parse(await readFile("target/idl/day_4.json", "utf8")) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/day_4.so"));

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
  it("input test", async () => {
    const idl = JSON.parse(await readFile("target/idl/day_4.json", "utf8")) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/day_4.so"));

    const client = new Day4Client();

    const tooSmall = vm.processInstruction(
      client.createLimitRangeInstruction({ a: 9n }),
      [],
    );

    console.log(tooSmall.logs.join("\n"));
    expect(tooSmall.status.ok).toBe(false);
    if (!tooSmall.status.ok) {
      expect(tooSmall.status.error.type).toBe("Custom");
      if (tooSmall.status.error.type === "Custom") {
        expect(PROGRAM_ERRORS[tooSmall.status.error.code]).toEqual({
          name: "AIsTooSmall",
          msg: "a is too small",
        });
      }
    }

    const tooBig = vm.processInstruction(
      client.createLimitRangeInstruction({ a: 101n }),
      [],
    );

    console.log(tooBig.logs.join("\n"));
    console.log(JSON.stringify(tooBig.status));
    expect(tooBig.status.ok).toBe(false);
    if (!tooBig.status.ok) {
      expect(tooBig.status.error.type).toBe("Custom");
      if (tooBig.status.error.type === "Custom") {
        expect(PROGRAM_ERRORS[tooBig.status.error.code]).toEqual({
          name: "AIsTooBig",
          msg: "a is too big",
        });
      }
    }
  });
  it("error test", async () => {
    const idl = JSON.parse(await readFile("target/idl/day_4.json", "utf8")) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/day_4.so"));

    const client = new Day4Client();

    const result = vm.processInstruction(
      client.createFuncInstruction(),
      [],
    );

    console.log(result.logs.join("\n"));
    expect(result.status.ok).toBe(false);
    if (!result.status.ok) {
      expect(result.status.error.type).toBe("Custom");
      if (result.status.error.type === "Custom") {
        expect(PROGRAM_ERRORS[result.status.error.code]).toEqual({
          name: "AlwaysErrors",
          msg: "Always errors",
        });
      }
    }
  });

});
