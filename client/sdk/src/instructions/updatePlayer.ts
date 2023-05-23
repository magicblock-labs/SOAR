import { type Program } from "@coral-xyz/anchor";
import { type PublicKey, type TransactionInstruction } from "@solana/web3.js";
import { type Soar } from "../idl/soar";

export const updatePlayerInstruction = async (
  program: Program<Soar>,
  user: PublicKey,
  userPlayerAccount: PublicKey,
  updatedUsername: string | null,
  updatedNftMeta: PublicKey | null
): Promise<TransactionInstruction> => {
  const accounts = {
    user,
    playerInfo: userPlayerAccount,
  };
  return program.methods
    .updatePlayer(updatedUsername, updatedNftMeta)
    .accounts(accounts)
    .instruction();
};
