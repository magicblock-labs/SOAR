import { type Program } from "@coral-xyz/anchor";
import {
  type PublicKey,
  type TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import { TOKEN_METADATA_PROGRAM_ID } from "../constants";

export const addRewardInstruction = async (
  program: Program<Soar>,
  authority: PublicKey,
  payer: PublicKey,
  achievement: PublicKey,
  game: PublicKey,
  newRewardAccount: PublicKey,
  uri: string,
  name: string,
  symbol: string,
  collectionUpdateAuth: PublicKey | null,
  collectionMint: PublicKey | null,
  collectionMetadata: PublicKey | null
): Promise<TransactionInstruction> => {
  return program.methods
    .addReward({ uri, name, symbol })
    .accounts({
      authority,
      payer,
      game,
      achievement,
      newReward: newRewardAccount,
      collectionUpdateAuth,
      collectionMint,
      collectionMetadata,
      systemProgram: SystemProgram.programId,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    })
    .instruction();
};
