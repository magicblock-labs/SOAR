import { type Program } from "@coral-xyz/anchor";
import {
  type PublicKey,
  SystemProgram,
  type TransactionInstruction,
} from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import { type GameType, type Genre } from "../state/game";

export const initializeGameInstruction = async (
  program: Program<Soar>,
  newGame: PublicKey,
  creator: PublicKey,
  title: string,
  description: string,
  genre: Genre,
  gameType: GameType,
  nftMeta: PublicKey,
  authorities: PublicKey[]
): Promise<TransactionInstruction> => {
  return program.methods
    .initializeGame(
      { title, description, genre, gameType, nftMeta },
      authorities
    )
    .accounts({
      creator,
      game: newGame,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
};
