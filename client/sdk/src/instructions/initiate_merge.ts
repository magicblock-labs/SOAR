import { type Program } from "@coral-xyz/anchor";
import {
  type AccountMeta,
  type Keypair,
  type PublicKey,
  type TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { type Soar } from "../idl/soar";

export const initiateMergeInstruction = async (
  program: Program<Soar>,
  user: PublicKey,
  userPlayerAccount: PublicKey,
  newMergeAccount: Keypair,
  others: AccountMeta[]
): Promise<TransactionInstruction> => {
  return program.methods
    .initiateMerge()
    .accounts({
      user,
      playerInfo: userPlayerAccount,
      mergeAccount: newMergeAccount.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .remainingAccounts(others)
    .signers([newMergeAccount])
    .instruction();
};
