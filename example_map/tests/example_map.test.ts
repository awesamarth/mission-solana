import { generateKeyPairSigner, address } from "@solana/kit";
import { describe, it, expect } from "vitest";
import { QuasarSvm, createKeyedSystemAccount } from "@blueshift-gg/quasar-svm/kit";
import { readFile } from "node:fs/promises";
import { ExampleMapClient, findValAddress } from "../target/client/typescript/example_map/kit";

describe.concurrent("ExampleMap Program", async () => {
  it("initializes and sets a mapping value", async () => {
    const idl = JSON.parse(await readFile("target/idl/example_map.json", "utf8")) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/example_map.so"));

    const payer = await generateKeyPairSigner();
    const client = new ExampleMapClient();
    const key1 = 42n;
    const key2 = 43n;
    const key3 = 44n;
    const value = 1337n;
    const valAddress = await findValAddress(key1, key2, key3);

    console.log("the value account address is", valAddress);

    const initializeInstruction = await client.createInitializeInstruction({
      payer: payer.address,
      systemProgram: address("11111111111111111111111111111111"),
      key1,
      key2,
      key3,
    });

    const setInstruction = await client.createSetInstruction({
      key1,
      key2,
      key3,
      value,
    });

    const result = vm.processInstructionChain(
      [initializeInstruction, setInstruction],
      [
        createKeyedSystemAccount(payer.address),
        createKeyedSystemAccount(valAddress, 0n),
      ],
    );

    expect(result.status.ok, `example_map failed:\n${result.logs.join("\n")}`).toBe(true);

    const valAccount = result.account(valAddress);
    expect(valAccount).not.toBeNull();
    expect(client.decodeVal(valAccount!.data).value).toBe(value);
  });
});
