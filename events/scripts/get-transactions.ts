import { address, createSolanaRpc, devnet, type Signature } from "@solana/kit";

const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
const targetAddress = address("5yDpyuSofQARocCtzkrHaEeRjSBTuYTPPna1aeZjqUB6");
const limit = 3;

const transactions = await rpc
  .getSignaturesForAddress(targetAddress, { limit })
  .send();

const signatures = transactions.map((transaction) => transaction.signature);
console.log(signatures);

for (const signature of signatures) {
  const transaction = await rpc
    .getTransaction(signature as Signature, {
      encoding: "jsonParsed",
      maxSupportedTransactionVersion: 0,
    })
    .send();

  console.dir(transaction, { depth: null });
}
