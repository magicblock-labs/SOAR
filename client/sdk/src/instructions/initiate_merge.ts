import { type Program } from "@coral-xyz/anchor";
import {
  type AccountMeta,
  type PublicKey,
  type TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { type Soar } from "../idl/soar";

export const initiateMergeInstruction = async (
  program: Program<Soar>,
  user: PublicKey,
  payer: PublicKey,
  userPlayerAccount: PublicKey,
  newMergeAccount: PublicKey,
  others: AccountMeta[]
): Promise<TransactionInstruction> => {
  return program.methods
    .initiateMerge()
    .accounts({
      user,
      payer,
      playerInfo: userPlayerAccount,
      mergeAccount: newMergeAccount,
      systemProgram: SystemProgram.programId,
    })
    .remainingAccounts(others)
    .instruction();
};
