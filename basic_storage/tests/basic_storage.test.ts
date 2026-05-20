import { generateKeyPairSigner, address } from "@solana/kit";
import { describe, it, expect } from "vitest";
import { QuasarSvm, createKeyedSystemAccount } from "@blueshift-gg/quasar-svm/kit";
import { readFile } from "node:fs/promises";
import { BasicStorageClient, findMyStorageAddress } from "../target/client/typescript/basic_storage/kit";

describe.concurrent("BasicStorage Program", async () => {
  it("initializes", async () => {
    const idl = JSON.parse(await readFile("target/idl/basic_storage.json", "utf8")) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/basic_storage.so"));

    const payer = await generateKeyPairSigner();
    const client = new BasicStorageClient();
    const myStorage = await findMyStorageAddress();

    console.log("the storage account address is", myStorage);

    const initializeInstruction = await client.createInitializeInstruction({
      signer: payer.address,
      systemProgram: address("11111111111111111111111111111111"),
    });

    const result = vm.processInstruction(initializeInstruction, [
      createKeyedSystemAccount(payer.address),
    ]);

    expect(result.status.ok, `initialize failed:\n${result.logs.join("\n")}`).toBe(true);
  });
});
