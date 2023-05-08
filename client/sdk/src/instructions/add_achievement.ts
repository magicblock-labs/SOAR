import { type Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { Soar } from "../idl/soar";
import { deriveAchievementAddress } from "../utils";

export type AddAchievementArgs = {
  title: string,
  description: string,
  nftMeta: PublicKey,
}
type AddAchievementAccounts = Soar["instructions"]["2"]["accounts"];

export const addAchievement = async (
  program: Program<Soar>,
  game: PublicKey,
  payer: PublicKey,
  authority: PublicKey,
  title: string,
  description: string,
  nftMeta: PublicKey,
): Promise<TransactionInstruction> => {
  const newAchievement = deriveAchievementAddress(game, title, program.programId)[0];

  return program.methods
    .addAchievement(title, description, nftMeta)
    .accounts({
      authority: authority,
      game,
      payer,
      newAchievement,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}