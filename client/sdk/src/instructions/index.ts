export * from "./add_achievement";
export * from "./add_leaderboard";
export * from "./create_player";
export * from "./initialize_game";
export * from "./merge_player_accounts";
export * from "./register_player";
export * from "./submit_score";
export * from "./update_achievement";
export * from "./update_game";
export * from "./update_player";

import { AnchorProvider } from "@coral-xyz/anchor";
import { Transaction, Signer, ConfirmOptions } from "@solana/web3.js";

export const sendAndConfirmTransaction = (
  provider: AnchorProvider,
  transaction: Transaction,
  signers?: Signer[],
  opts?: ConfirmOptions
): Promise<string> => {
  return provider
    .sendAndConfirm(transaction, signers, opts)
    .catch((e) => {
      console.log(e.logs);
      throw e;
    });
}

/**
 * Send and confirm multiple transactions in sequence
 * @param transactions
 * @param signers
 * @param opts
 */
export const sendAndConfirmTransactions = async (
  provider: AnchorProvider,
  transactions: Transaction[],
  signers: Signer[][] = [],
  opts?: ConfirmOptions
): Promise<string[]> => {
  const txesWithSigners = zip(transactions, signers, []);
  const txSigs: string[] = [];

  console.log("Sending transactions: ", transactions.length);
  for (const [tx, signers] of txesWithSigners) {
    const txSig = await sendAndConfirmTransaction(provider, tx, signers, opts);
    console.log("Transaction sent: ", txSig);
    txSigs.push(txSig);
  }

  return txSigs;
}

export const zip = <T, U>(a: T[], b: U[], defaultB: U): Array<[T, U]> =>
  a.map((k, i) => {
    if (b.length <= i) return [k, defaultB];
    return [k, b[i]];
  });