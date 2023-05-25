import { type Program } from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  type PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  type TransactionInstruction,
} from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import { TOKEN_METADATA_PROGRAM_ID } from "../constants";

export const claimRewardInstruction = async (
  program: Program<Soar>,
  user: PublicKey,
  userPlayerAccount: PublicKey,
  game: PublicKey,
  achievementAccount: PublicKey,
  rewardAccount: PublicKey,
  playerAchievementAccount: PublicKey,
  nftRewardAccounts?: {
    feePayer: PublicKey;
    claim: PublicKey;
    newMint: PublicKey;
    newMetadata: PublicKey;
    newMasterEdition: PublicKey;
    mintNftTo: PublicKey;
  },
  ftRewardAccounts?: {
    sourceTokenAccount: PublicKey;
    userTokenAccount: PublicKey;
  }
): Promise<TransactionInstruction> => {
  if (nftRewardAccounts !== undefined && ftRewardAccounts !== undefined) {
    throw new Error("Only one of nft or ft reward should be specified");
  }
  if (nftRewardAccounts === undefined && ftRewardAccounts === undefined) {
    throw new Error("One of nft or ft rewards must be specified");
  }

  const accounts = {
    user,
    game,
    achievement: achievementAccount,
    reward: rewardAccount,
    playerAccount: userPlayerAccount,
    playerAchievement: playerAchievementAccount,
    tokenProgram: TOKEN_PROGRAM_ID,

    claim: nftRewardAccounts ? nftRewardAccounts.claim : null,
    nftRewardMint: nftRewardAccounts ? nftRewardAccounts.newMint : null,
    nftRewardMetadata: nftRewardAccounts ? nftRewardAccounts.newMetadata : null,
    nftRewardMasterEdition: nftRewardAccounts
      ? nftRewardAccounts.newMasterEdition
      : null,
    nftRewardMintTo: nftRewardAccounts ? nftRewardAccounts.mintNftTo : null,

    associatedTokenProgram: nftRewardAccounts
      ? ASSOCIATED_TOKEN_PROGRAM_ID
      : null,
    systemProgram: nftRewardAccounts ? SystemProgram.programId : null,
    tokenMetadataProgram: nftRewardAccounts ? TOKEN_METADATA_PROGRAM_ID : null,
    rent: nftRewardAccounts ? SYSVAR_RENT_PUBKEY : null,

    sourceTokenAccount: ftRewardAccounts
      ? ftRewardAccounts.sourceTokenAccount
      : null,
    userTokenAccount: ftRewardAccounts
      ? ftRewardAccounts.userTokenAccount
      : null,
  };

  return program.methods.claimReward().accounts(accounts).instruction();
};
