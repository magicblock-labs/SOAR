import { type Program } from "@coral-xyz/anchor";
import {
  type PublicKey,
  type TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import type BN from "bn.js";

export const submitScoreInstruction = async (
  program: Program<Soar>,
  user: PublicKey,
  userPlayerAccount: PublicKey,
  authority: PublicKey,
  game: PublicKey,
  leaderboard: PublicKey,
  playerEntryListAddress: PublicKey,
  score: BN,
  rank: BN | null
): Promise<TransactionInstruction> => {
  return program.methods
    .submitScore(score, rank)
    .accounts({
      user,
      authority,
      playerInfo: userPlayerAccount,
      game,
      leaderboard,
      playerEntries: playerEntryListAddress,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
};
