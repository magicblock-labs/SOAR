import { type Program } from "@coral-xyz/anchor";
import {
  type PublicKey,
  SystemProgram,
  type TransactionInstruction,
} from "@solana/web3.js";
import { type Soar } from "../idl/soar";

export const registerPlayerEntryInstruction = async (
  program: Program<Soar>,
  user: PublicKey,
  userPlayerAccount: PublicKey,
  newEntryList: PublicKey,
  gameAddress: PublicKey,
  leaderboard: PublicKey
): Promise<TransactionInstruction> => {
  return program.methods
    .registerPlayer()
    .accounts({
      user,
      playerInfo: userPlayerAccount,
      game: gameAddress,
      leaderboard,
      newList: newEntryList,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
};
