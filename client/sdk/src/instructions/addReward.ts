import { type Program } from "@coral-xyz/anchor";
import {
  type PublicKey,
  SystemProgram,
  type TransactionInstruction,
} from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import type BN from "bn.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const addFtRewardInstruction = async (
  program: Program<Soar>,
  amountPerUser: BN,
  availableRewards: BN,
  args: {
    deposit: BN;
  },
  authority: PublicKey,
  payer: PublicKey,
  game: PublicKey,
  achievement: PublicKey,
  newReward: PublicKey,
  rewardTokenMint: PublicKey,
  delegateFromTokenAccount: PublicKey,
  tokenAccountOwner: PublicKey
): Promise<TransactionInstruction> => {
  const accounts = {
    authority,
    payer,
    game,
    achievement,
    newReward,
    rewardTokenMint,
    delegateFromTokenAccount,
    tokenAccountOwner,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  };

  return program.methods
    .addFtReward({
      amountPerUser,
      availableRewards,
      kind: {
        ft: args,
      },
    })
    .accounts(accounts)
    .instruction();
};

export const addNftRewardInstruction = async (
  program: Program<Soar>,
  amountPerUser: BN,
  availableRewards: BN,
  args: {
    uri: string;
    name: string;
    symbol: string;
  },
  authority: PublicKey,
  payer: PublicKey,
  game: PublicKey,
  achievement: PublicKey,
  newReward: PublicKey,
  rewardCollectionMint: PublicKey | null,
  collectionUpdateAuth: PublicKey | null,
  collectionMetadata: PublicKey | null,
  tokenMetadataProgram: PublicKey | null
): Promise<TransactionInstruction> => {
  const accounts = {
    authority,
    payer,
    game,
    achievement,
    newReward,
    rewardCollectionMint,
    collectionUpdateAuth,
    collectionMetadata,
    systemProgram: SystemProgram.programId,
    tokenMetadataProgram,
  };

  return program.methods
    .addNftReward({
      amountPerUser,
      availableRewards,
      kind: {
        nft: args,
      },
    })
    .accounts(accounts)
    .instruction();
};
