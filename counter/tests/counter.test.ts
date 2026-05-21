import { generateKeyPairSigner, address } from "@solana/kit";
import { describe, it, expect } from "vitest";
import { QuasarSvm, createKeyedSystemAccount } from "@blueshift-gg/quasar-svm/kit";
import { readFile } from "node:fs/promises";
import { CounterClient, findMyStorageAddress } from "../target/client/typescript/counter/kit";


describe.concurrent("Counter Program", async () => {
  it("initializes", async () => {
    const idl = JSON.parse(await readFile("target/idl/counter.json", "utf8")) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/counter.so"));

    const payer = await generateKeyPairSigner();
    const client = new CounterClient();
    const myStorage = await findMyStorageAddress();

    console.log("the storage account address is", myStorage);

    const initializeInstruction = await client.createInitializeInstruction({
      payer: payer.address,
      systemProgram: address("11111111111111111111111111111111"),
    });

    const setInstruction = await client.createSetInstruction({ new_x: 170n, new_y:200n, new_z:300n });

    const result = vm.processInstructionChain(
      [initializeInstruction, setInstruction],
      [
        createKeyedSystemAccount(payer.address),
        createKeyedSystemAccount(myStorage, 0n),
      ],
    );

    expect(result.status.ok, `counter failed:\n${result.logs.join("\n")}`).toBe(true);

    const storageAccount = result.account(myStorage);
    expect(storageAccount).not.toBeNull();
    expect(client.decodeMyStorage(storageAccount!.data).x).toBe(170n);
    expect(client.decodeMyStorage(storageAccount!.data).y).toBe(200n);
    expect(client.decodeMyStorage(storageAccount!.data).z).toBe(300n);

  });
});
