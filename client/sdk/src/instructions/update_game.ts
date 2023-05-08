import { type Program } from "@coral-xyz/anchor";
import { PublicKey, TransactionInstruction, SystemProgram } from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import { GameMeta } from "../state/accounts";

export type UpdateGameArgs = {
  newMeta: GameMeta | null,
  newAuth: PublicKey[] | null,
}
type UpdateGameAccounts = Soar["instructions"]["1"]["accounts"];

export const updateGame = async (
  program: Program<Soar>,
  payer: PublicKey,
  game: PublicKey,
  authority: PublicKey,
  newMeta: GameMeta | null,
  newAuths: PublicKey[] | null,
): Promise<TransactionInstruction> => {
  return program.methods
    .updateGame(newMeta, newAuths)
    .accounts({
      authority: authority,
      payer,
      game,
      systemProgram: SystemProgram.programId
    })
    .instruction();
}

