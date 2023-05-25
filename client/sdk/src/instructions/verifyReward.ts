import { type Program } from "@coral-xyz/anchor";
import { type PublicKey, type TransactionInstruction } from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import { TOKEN_METADATA_PROGRAM_ID } from "../constants";

export const verifyNftRewardInstruction = async (
  program: Program<Soar>,
  payer: PublicKey,
  user: PublicKey,
  userPlayerAccount: PublicKey,
  gameAccount: PublicKey,
  achievementAccount: PublicKey,
  rewardAccount: PublicKey,
  playerAchievementAccount: PublicKey,
  mint: PublicKey,
  claim: PublicKey,
  metadata: PublicKey,
  collectionMint: PublicKey,
  collectionMetadata: PublicKey,
  collectionMasterEdition: PublicKey
): Promise<TransactionInstruction> => {
  const accounts = {
    payer,
    user,
    game: gameAccount,
    achievement: achievementAccount,
    reward: rewardAccount,
    playerAccount: userPlayerAccount,
    playerAchievement: playerAchievementAccount,
    mint,
    claim,
    metadataToVerify: metadata,
    collectionMint,
    collectionMetadata,
    collectionMasterEdition,
    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
  };

  return program.methods.verifyNftReward().accounts(accounts).instruction();
};
