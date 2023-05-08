import { type Program } from "@coral-xyz/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { type Soar } from "../idl/soar";

export type UpdateAchievementArgs = {
  newTitle: string | null,
  newDescription: string | null,
  nftMeta: PublicKey | null,
}
type UpdateAchievementAccounts = Soar["instructions"]["3"]["accounts"];

export const updateAchievement = async (
  program: Program<Soar>,
  achievement: PublicKey,
  authority: PublicKey,
  newTitle: string | null,
  newDescription: string | null,
  newNftMeta: PublicKey | null
): Promise<TransactionInstruction> => {
  const account = await program.account.achievement.fetch(achievement);
  const game = account.game;

  return program.methods
    .updateAchievement(newTitle, newDescription, newNftMeta)
    .accounts({
      authority: authority,
      game,
      achievement,
    })
    .instruction();
}

