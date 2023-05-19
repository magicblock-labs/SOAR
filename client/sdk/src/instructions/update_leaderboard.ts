import { type Program } from "@coral-xyz/anchor";
import {
  type PublicKey,
  type TransactionInstruction,
} from "@solana/web3.js";
import { type Soar } from "../idl/soar";

export const updateLeaderBoardInstruction = async (
  program: Program<Soar>,
  authority: PublicKey,
  gameAddress: PublicKey,
  leaderboard: PublicKey,
  newDescription: string | null,
  newNftMeta: PublicKey | null,
): Promise<TransactionInstruction> => {
  const accounts = {
    authority,
    leaderboard,
    game: gameAddress,
  };
  return program.methods
    .updateLeaderboard(newDescription, newNftMeta)
    .accounts(accounts)
    .instruction();
};
