import { type Program } from "@coral-xyz/anchor";
import { type PublicKey, type TransactionInstruction } from "@solana/web3.js";
import { type Soar } from "../idl/soar";

export const verifyRewardInstruction = async (
  program: Program<Soar>,
  authority: PublicKey,
  payer: PublicKey,
  user: PublicKey,
  userPlayerAccount: PublicKey,
  gameAccount: PublicKey,
  achievementAccount: PublicKey,
  rewardAccount: PublicKey,
  playerAchievementAccount: PublicKey,
  metadata: PublicKey,
  collectionMint: PublicKey,
  collectionMetadata: PublicKey,
  collectionMasterEdition: PublicKey
): Promise<TransactionInstruction> => {
  return program.methods
    .verifyReward()
    .accounts({
      payer,
      authority,
      user,
      game: gameAccount,
      achievement: achievementAccount,
      reward: rewardAccount,
      player: userPlayerAccount,
      playerAchievement: playerAchievementAccount,
      metadataToVerify: metadata,
      collectionMint,
      collectionMetadata,
      collectionMasterEdition,
    })
    .instruction();
};
