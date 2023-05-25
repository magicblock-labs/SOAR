import { type Program } from "@coral-xyz/anchor";
import { type PublicKey, type TransactionInstruction } from "@solana/web3.js";
import { type Soar } from "../idl/soar";

export const registerMergeApprovalInstruction = async (
  program: Program<Soar>,
  user: PublicKey,
  userPlayerAccount: PublicKey,
  mergeAccount: PublicKey
): Promise<TransactionInstruction> => {
  const accounts = {
    user,
    playerAccount: userPlayerAccount,
    mergeAccount,
  };
  return program.methods.approveMerge().accounts(accounts).instruction();
};
