import { type Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import { derivePlayerInfoAddress } from "../utils";

export type CreatePlayerArgs = {
  username: string,
  nftMeta: PublicKey,
}
type CreatePlayerAccounts = Soar["instructions"]["5"]["accounts"];

export const createPlayer = async (
  program: Program<Soar>,
  user: PublicKey,
  username: string,
  nftMeta: PublicKey,
): Promise<TransactionInstruction> => {
  const newPlayer = derivePlayerInfoAddress(user, program.programId)[0];

  return program.methods
    .createPlayer(username, nftMeta)
    .accounts({
      user: user,
      playerInfo: newPlayer,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}

