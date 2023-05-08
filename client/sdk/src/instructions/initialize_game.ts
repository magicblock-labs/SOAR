import { type Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import { deriveGameAddress, deriveLeaderBoardAddress } from "../utils";
import BN  from "bn.js";
import { GameMeta } from "../state/accounts";

export type InitializeGameArgs = {
  gameMeta: GameMeta,
  gameAuth: PublicKey[],
}
type InitializeGameAccounts = Soar["instructions"]["0"]["accounts"];

export const initializeGame = async (
  program: Program<Soar>,
  creator: PublicKey,
  title: string,
  description: string,
  genre: string,
  gameType: string,
  nftMeta: PublicKey,
  authorities: PublicKey[]
): Promise<TransactionInstruction> => {
  const newGame = deriveGameAddress(creator, program.programId)[0];

  return program.methods
    .initializeGame({title, description, genre, gameType, nftMeta}, authorities)
    .accounts({
      creator,
      game: newGame,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}

