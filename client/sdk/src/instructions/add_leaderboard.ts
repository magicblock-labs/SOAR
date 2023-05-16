import { type Program } from "@coral-xyz/anchor";
import {
  type PublicKey,
  SystemProgram,
  type TransactionInstruction,
} from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import type BN from "bn.js";

export const addLeaderBoardInstruction = async (
  program: Program<Soar>,
  newLeaderBoard: PublicKey,
  payer: PublicKey,
  gameAddress: PublicKey,
  topEntriesAddress: PublicKey,
  authority: PublicKey,
  description: string,
  nftMeta: PublicKey,
  scoresToRetain: number,
  scoresOrder: boolean,
  decimals: number | null,
  minScore: BN | null,
  maxScore: BN | null
): Promise<TransactionInstruction> => {
  return program.methods
    .addLeaderboard({
      description,
      nftMeta,
      decimals,
      minScore,
      maxScore,
      scoresToRetain,
      scoresOrder,
    })
    .accounts({
      authority,
      game: gameAddress,
      payer,
      leaderboard: newLeaderBoard,
      topEntries: topEntriesAddress,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
};
