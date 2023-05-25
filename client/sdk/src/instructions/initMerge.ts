import { type Program } from "@coral-xyz/anchor";
import {
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
  keys: PublicKey[]
): Promise<TransactionInstruction> => {
  const accounts = {
    user,
    payer,
    playerAccount: userPlayerAccount,
    mergeAccount: newMergeAccount,
    systemProgram: SystemProgram.programId,
  };
  return program.methods.initiateMerge(keys).accounts(accounts).instruction();
};
