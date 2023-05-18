import { type Program } from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  type Keypair,
  type PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  type TransactionInstruction,
} from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import { TOKEN_METADATA_PROGRAM_ID } from "../constants";

export const mintRewardInstruction = async (
  program: Program<Soar>,
  authority: PublicKey,
  payer: PublicKey,
  user: PublicKey,
  userPlayerAccount: PublicKey,
  gameAccount: PublicKey,
  achievementAccount: PublicKey,
  rewardAccount: PublicKey,
  playerAchievementAccount: PublicKey,
  newMint: Keypair,
  newMetadata: PublicKey,
  newMasterEdition: PublicKey,
  mintNftTo: PublicKey
): Promise<TransactionInstruction> => {
  const accounts = {
    payer,
    authority,
    user,
    game: gameAccount,
    achievement: achievementAccount,
    reward: rewardAccount,
    player: userPlayerAccount,
    playerAchievement: playerAchievementAccount,
    mint: newMint.publicKey,
    metadata: newMetadata,
    masterEdition: newMasterEdition,
    mintNftTo,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    rent: SYSVAR_RENT_PUBKEY,
  };
  return program.methods
    .mintReward()
    .accounts(accounts)
    .signers([newMint])
    .instruction();
};
