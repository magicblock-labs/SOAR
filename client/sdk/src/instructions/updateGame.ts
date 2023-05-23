import { type IdlTypes, type Program } from "@coral-xyz/anchor";
import {
  type PublicKey,
  type TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { type Soar } from "../idl/soar";

export const updateGameInstruction = async (
  program: Program<Soar>,
  payer: PublicKey,
  gameAddress: PublicKey,
  authority: PublicKey,
  newMeta: IdlTypes<Soar>["GameMeta"] | null,
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
