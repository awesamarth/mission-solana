 import {
    address,
    appendTransactionMessageInstruction,
    assertIsTransactionWithBlockhashLifetime,
    createKeyPairSignerFromBytes,
    createSolanaRpc,
    createSolanaRpcSubscriptions,
    createTransactionMessage,
    getSignatureFromTransaction,
    pipe,
    sendAndConfirmTransactionFactory,
    setTransactionMessageFeePayerSigner,
    setTransactionMessageLifetimeUsingBlockhash,
    signTransactionMessageWithSigners,
  } from "@solana/kit";
  import { readFileSync } from "node:fs";
  import { Day5Client } from "../target/client/typescript/day_5/kit";

  const rpc = createSolanaRpc("http://127.0.0.1:8899");
  const rpcSubscriptions = createSolanaRpcSubscriptions("ws://127.0.0.1:8900");

  const keypairPath =
    process.env.SOLANA_KEYPAIR ?? `${process.env.HOME}/.config/solana/id.json`;

  const payer = await createKeyPairSignerFromBytes(
    new Uint8Array(JSON.parse(readFileSync(keypairPath, "utf8"))),
  );

  const client = new Day5Client();

  const ix = client.createInitializeInstruction({
    payer: payer.address,
    systemProgram: address("11111111111111111111111111111111"),
  });

  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  const message = pipe(
    createTransactionMessage({ version: 0 }),
    tx => setTransactionMessageFeePayerSigner(payer, tx),
    tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    tx => appendTransactionMessageInstruction(ix, tx),
  );

  const signedTx = await signTransactionMessageWithSigners(message);
  assertIsTransactionWithBlockhashLifetime(signedTx);
  const signature = getSignatureFromTransaction(signedTx);

  await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(signedTx, {
    commitment: "confirmed",
  });

  console.log("Your transaction signature", signature);
