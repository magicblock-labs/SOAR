import { type Program } from "@coral-xyz/anchor";
import {
  type PublicKey,
  SystemProgram,
  type TransactionInstruction,
} from "@solana/web3.js";
import { type Soar } from "../idl/soar";

export const addAchievementInstruction = async (
  program: Program<Soar>,
  newAchievementAddress: PublicKey,
  game: PublicKey,
  payer: PublicKey,
  authority: PublicKey,
  title: string,
  description: string,
  nftMeta: PublicKey
): Promise<TransactionInstruction> => {
  return program.methods
    .addAchievement(title, description, nftMeta)
    .accounts({
      authority,
      game,
      payer,
      newAchievement: newAchievementAddress,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
};
