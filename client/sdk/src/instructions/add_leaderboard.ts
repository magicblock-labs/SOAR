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
  topEntries: PublicKey | null,
  authority: PublicKey,
  description: string,
  nftMeta: PublicKey,
  scoresToRetain: number,
  scoresOrder: boolean,
  decimals: number | null,
  minScore: BN | null,
  maxScore: BN | null
): Promise<TransactionInstruction> => {
  const accounts = {
    authority,
    game: gameAddress,
    payer,
    leaderboard: newLeaderBoard,
    topEntries,
    systemProgram: SystemProgram.programId,
  };
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
    .accounts(accounts)
    .instruction();
};
