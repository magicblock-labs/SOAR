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

export const claimFtRewardInstruction = async (
  program: Program<Soar>,
  user: PublicKey,
  userPlayerAccount: PublicKey,
  game: PublicKey,
  achievementAccount: PublicKey,
  rewardAccount: PublicKey,
  playerAchievementAccount: PublicKey,
  sourceTokenAccount: PublicKey,
  userTokenAccount: PublicKey
): Promise<TransactionInstruction> => {
  const accounts = {
    user,
    game,
    achievement: achievementAccount,
    reward: rewardAccount,
    playerAccount: userPlayerAccount,
    playerAchievement: playerAchievementAccount,
    sourceTokenAccount,
    userTokenAccount,
    tokenProgram: TOKEN_PROGRAM_ID,
  };

  return program.methods.claimFtReward().accounts(accounts).instruction();
};

export const claimNftRewardInstruction = async (
  program: Program<Soar>,
  user: PublicKey,
  userPlayerAccount: PublicKey,
  game: PublicKey,
  achievementAccount: PublicKey,
  rewardAccount: PublicKey,
  playerAchievementAccount: PublicKey,
  feePayer: PublicKey,
  claim: PublicKey,
  newMint: PublicKey,
  newMetadata: PublicKey,
  newMasterEdition: PublicKey,
  mintNftTo: PublicKey
): Promise<TransactionInstruction> => {
  const accounts = {
    user,
    game,
    payer: feePayer,
    achievement: achievementAccount,
    reward: rewardAccount,
    playerAccount: userPlayerAccount,
    playerAchievement: playerAchievementAccount,
    claim,
    newMint,
    newMetadata,
    newMasterEdition,
    mintTo: mintNftTo,
    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
    rent: SYSVAR_RENT_PUBKEY,
  };

  return program.methods.claimNftReward().accounts(accounts).instruction();
};
