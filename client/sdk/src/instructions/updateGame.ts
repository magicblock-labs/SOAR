import { type Program } from "@coral-xyz/anchor";
import {
  type PublicKey,
  type TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import { type GameAttributes } from "../state";

export const updateGameInstruction = async (
  program: Program<Soar>,
  payer: PublicKey,
  gameAddress: PublicKey,
  authority: PublicKey,
  newMeta: GameAttributes | null,
  newAuths: PublicKey[] | null
): Promise<TransactionInstruction> => {
  const accounts = {
    authority,
    payer,
    game: gameAddress,
    systemProgram: SystemProgram.programId,
  };
  return program.methods
    .updateGame(newMeta, newAuths)
    .accounts(accounts)
    .instruction();
};
