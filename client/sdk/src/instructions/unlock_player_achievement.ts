import { type Program } from "@coral-xyz/anchor";
import {
  SystemProgram,
  type PublicKey,
  type TransactionInstruction,
} from "@solana/web3.js";
import { type Soar } from "../idl/soar";

export const unlockPlayerAchievementInstruction = async (
  program: Program<Soar>,
  user: PublicKey,
  payer: PublicKey,
  userPlayerAccount: PublicKey,
  userEntryListAccount: PublicKey,
  game: PublicKey,
  leaderboard: PublicKey,
  achievement: PublicKey,
  authority: PublicKey,
  newPlayerAchievementAccount: PublicKey
): Promise<TransactionInstruction> => {
  return program.methods
    .unlockPlayerAchievement()
    .accounts({
      authority,
      user,
      payer,
      playerInfo: userPlayerAccount,
      playerEntry: userEntryListAccount,
      leaderboard,
      game,
      achievement,
      playerAchievement: newPlayerAchievementAccount,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
};
