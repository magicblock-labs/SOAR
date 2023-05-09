import { type Program } from "@coral-xyz/anchor";
import {
  type PublicKey,
  SystemProgram,
  type TransactionInstruction,
} from "@solana/web3.js";
import { type Soar } from "../idl/soar";

export const addLeaderBoardInstruction = async (
  program: Program<Soar>,
  newLeaderBoard: PublicKey,
  payer: PublicKey,
  gameAddress: PublicKey,
  authority: PublicKey,
  description: string,
  nftMeta: PublicKey
): Promise<TransactionInstruction> => {
  return program.methods
    .addLeaderboard({ description, nftMeta })
    .accounts({
      authority,
      game: gameAddress,
      payer,
      leaderboard: newLeaderBoard,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
};
