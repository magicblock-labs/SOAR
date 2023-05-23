import { type Program } from "@coral-xyz/anchor";
import { type PublicKey, type TransactionInstruction } from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import type BN from "bn.js";

export const addRewardInstruction = async (
  program: Program<Soar>,
  args: {
    amountPerUser: BN;
    availableRewards: BN;
    kind: {
      ft:
        | {
            initial_delegated_amount: BN;
            mint: PublicKey;
          }
        | undefined;
      nft:
        | {
            uri: string;
            name: string;
            symbol: string;
          }
        | undefined;
    };
  },
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
    ftRewardTokenMint,
    ftRewardDelegateAccount,
    ftRewardDelegateAccountOwner,
    tokenProgram,
    nftRewardCollectionUpdateAuth,
    nftRewardCollectionMint,
    nftRewardCollectionMetadata,
    tokenMetadataProgram,
  };
  return program.methods.addReward(args).accounts(accounts).instruction();
};
