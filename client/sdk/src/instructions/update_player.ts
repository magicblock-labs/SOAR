import { type Program } from "@coral-xyz/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import { derivePlayerInfoAddress } from "../utils";

export type UpdatePlayerArgs = {
  username: string | null,
  nftMeta: PublicKey | null,
}
type UpdatePlayerAccounts = Soar["instructions"]["6"]["accounts"];

export const updatePlayer = async (
  program: Program<Soar>,
  user: PublicKey,
  updatedUsername: string | null,
  updatedNftMeta: PublicKey | null,
): Promise<TransactionInstruction> => {
  const playerInfo = derivePlayerInfoAddress(user, program.programId)[0];
  
  return program.methods
    .updatePlayer(updatedUsername, updatedNftMeta)
    .accounts({
      user,
      playerInfo
    })
    .instruction();
}

