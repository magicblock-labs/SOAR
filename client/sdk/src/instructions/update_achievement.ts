import { type Program } from "@coral-xyz/anchor";
import { type PublicKey, type TransactionInstruction } from "@solana/web3.js";
import { type Soar } from "../idl/soar";

export const updateAchievementInstruction = async (
  program: Program<Soar>,
  gameAddress: PublicKey,
  achievement: PublicKey,
  authority: PublicKey,
  newTitle: string | null,
  newDescription: string | null,
  newNftMeta: PublicKey | null
): Promise<TransactionInstruction> => {
  return program.methods
    .updateAchievement(newTitle, newDescription, newNftMeta)
    .accounts({
      authority,
      game: gameAddress,
      achievement,
    })
    .instruction();
};
