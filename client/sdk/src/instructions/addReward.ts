import { type Program } from "@coral-xyz/anchor";
import { type PublicKey, type TransactionInstruction } from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import type BN from "bn.js";

export const addRewardInstruction = async (
  program: Program<Soar>,
  amountPerUser: BN,
  availableRewards: BN,
  ft:
    | {
        deposit: BN;
        mint: PublicKey;
      }
    | undefined,
  nft:
    | {
        uri: string;
        name: string;
        symbol: string;
      }
    | undefined,
  authority: PublicKey,
  payer: PublicKey,
  game: PublicKey,
  achievement: PublicKey,
  newReward: PublicKey,
  systemProgram: PublicKey,
  ftRewardTokenMint?: PublicKey,
  ftRewardDelegateAccount?: PublicKey,
  ftRewardDelegateAccountOwner?: PublicKey,
  tokenProgram?: PublicKey,
  nftRewardCollectionUpdateAuth?: PublicKey,
  nftRewardCollectionMint?: PublicKey,
  nftRewardCollectionMetadata?: PublicKey,
  tokenMetadataProgram?: PublicKey
): Promise<TransactionInstruction> => {
  const accounts = {
    authority,
    payer,
    game,
    achievement,
    newReward,
    systemProgram,
    ftRewardTokenMint: ftRewardTokenMint ?? null,
    ftRewardDelegateAccount: ftRewardDelegateAccount ?? null,
    ftRewardDelegateAccountOwner: ftRewardDelegateAccountOwner ?? null,
    tokenProgram: tokenProgram ?? null,
    nftRewardCollectionUpdateAuth: nftRewardCollectionUpdateAuth ?? null,
    nftRewardCollectionMint: nftRewardCollectionMint ?? null,
    nftRewardCollectionMetadata: nftRewardCollectionMetadata ?? null,
    tokenMetadataProgram: tokenMetadataProgram ?? null,
  };

  let kind;
  if (nft !== undefined) {
    kind = { nft };
  } else if (ft !== undefined) {
    kind = { ft };
  } else {
    throw Error("Either or nft or ft must be defined");
  }

  return program.methods
    .addReward({ amountPerUser, availableRewards, kind })
    .accounts(accounts)
    .instruction();
};
