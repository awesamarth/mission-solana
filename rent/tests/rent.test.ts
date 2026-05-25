import { generateKeyPairSigner, address } from "@solana/kit";
import { describe, it, expect } from "vitest";
import { QuasarSvm, createKeyedSystemAccount } from "@blueshift-gg/quasar-svm/kit";
import { readFile } from "node:fs/promises";
import { RentClient, findMyStorageAddress } from "../target/client/typescript/rent/kit";

describe.concurrent("Rent Program", async () => {
  it("logs rent costs and reallocs storage", async () => {
    const idl = JSON.parse(await readFile("target/idl/rent.json", "utf8")) as { address: string };
    const programAddress = address(idl.address);
    const vm = new QuasarSvm();
    vm.addProgram(programAddress, await readFile("target/deploy/rent.so"));

    const payer = await generateKeyPairSigner();
    const client = new RentClient();
    const myStorage = await findMyStorageAddress();

    const systemProgram = address("11111111111111111111111111111111");
    const logRentCostsInstruction = client.createLogRentCostsInstruction();
    const initializeInstruction = await client.createInitializeInstruction({
      payer: payer.address,
      systemProgram,
    });
    const increaseAccountSizeInstruction = await client.createIncreaseAccountSizeInstruction({
      payer: payer.address,
      systemProgram,
    });

    const result = vm.processInstructionChain(
      [logRentCostsInstruction, initializeInstruction, increaseAccountSizeInstruction],
      [
        createKeyedSystemAccount(payer.address),
        createKeyedSystemAccount(myStorage, 0n),
      ],
    );

    console.log(result.logs.join("\n"));

    expect(result.status.ok, `rent test failed:\n${result.logs.join("\n")}`).toBe(true);

    const storageAccount = result.account(myStorage);
    expect(storageAccount).not.toBeNull();
    expect(storageAccount!.data.length).toBeGreaterThanOrEqual(1009);
  });
});
