import { type Soar } from "../idl/soar";
import {
  type AddAchievementArgs,
  type AddLeaderBoardArgs,
  type AddFtRewardArgs,
  type AddNftRewardArgs,
  type InitializeGameArgs,
  type InitializePlayerArgs,
  type SubmitScoreArgs,
  type UpdateAchievementArgs,
  type UpdatePlayerArgs,
  type UpdateLeaderboardArgs,
  type UpdateGameArgs,
  type InitMergeArgs,
} from "../types";
import { type PublicKey, type TransactionInstruction } from "@solana/web3.js";
import { type Program } from "@coral-xyz/anchor";

export const initializeGameInstruction = async (
  program: Program<Soar>,
  args: InitializeGameArgs,
  accounts: {
    creator: PublicKey;
    game: PublicKey;
    systemProgram: PublicKey;
  },
  pre?: TransactionInstruction[]
): Promise<TransactionInstruction> =>
  program.methods
    .initializeGame(args.gameMeta, args.authorities)
    .accounts(accounts)
    .preInstructions(pre ?? [])
    .instruction();

export const initPlayerInstruction = async (
  program: Program<Soar>,
  args: InitializePlayerArgs,
  accounts: {
    playerAccount: PublicKey;
    user: PublicKey;
    payer: PublicKey;
    systemProgram: PublicKey;
  },
  pre?: TransactionInstruction[]
): Promise<TransactionInstruction> =>
  program.methods
    .initializePlayer(args.username, args.nftMeta)
    .accounts(accounts)
    .preInstructions(pre ?? [])
    .instruction();

export const initiateMergeInstruction = async (
  program: Program<Soar>,
  args: InitMergeArgs,
  accounts: {
    user: PublicKey;
    payer: PublicKey;
    playerAccount: PublicKey;
    mergeAccount: PublicKey;
    systemProgram: PublicKey;
  },
  pre?: TransactionInstruction[]
): Promise<TransactionInstruction> =>
  program.methods
    .initiateMerge(args.keys)
    .accounts(accounts)
    .preInstructions(pre ?? [])
    .instruction();

export const addAchievementInstruction = async (
  program: Program<Soar>,
  args: AddAchievementArgs,
  accounts: {
    newAchievement: PublicKey;
    game: PublicKey;
    payer: PublicKey;
    authority: PublicKey;
    systemProgram: PublicKey;
  },
  pre?: TransactionInstruction[]
): Promise<TransactionInstruction> =>
  program.methods
    .addAchievement(args.title, args.description, args.nftMeta)
    .accounts(accounts)
    .preInstructions(pre ?? [])
    .instruction();

export const addLeaderBoardInstruction = async (
  program: Program<Soar>,
  args: AddLeaderBoardArgs,
  accounts: {
    authority: PublicKey;
    game: PublicKey;
    payer: PublicKey;
    leaderboard: PublicKey;
    topEntries: PublicKey | null;
    systemProgram: PublicKey;
  },
  pre?: TransactionInstruction[]
): Promise<TransactionInstruction> =>
  program.methods
    .addLeaderboard(args)
    .accounts(accounts)
    .preInstructions(pre ?? [])
    .instruction();

export const addFtRewardInstruction = async (
  program: Program<Soar>,
  args: AddFtRewardArgs,
  accounts: {
    authority: PublicKey;
    payer: PublicKey;
    game: PublicKey;
    achievement: PublicKey;
    newReward: PublicKey;
    rewardTokenMint: PublicKey;
    delegateFromTokenAccount: PublicKey;
    tokenAccountOwner: PublicKey;
    tokenProgram: PublicKey;
    systemProgram: PublicKey;
  },
  pre?: TransactionInstruction[]
): Promise<TransactionInstruction> =>
  program.methods
    .addFtReward({
      amountPerUser: args.amountPerUser,
      availableRewards: args.availableRewards,
      kind: {
        ft: args.kind,
      },
    })
    .accounts(accounts)
    .preInstructions(pre ?? [])
    .instruction();

export const addNftRewardInstruction = async (
  program: Program<Soar>,
  args: AddNftRewardArgs,
  accounts: {
    authority: PublicKey;
    payer: PublicKey;
    game: PublicKey;
    achievement: PublicKey;
    newReward: PublicKey;
    systemProgram: PublicKey;
    rewardCollectionMint: PublicKey | null;
    collectionUpdateAuth: PublicKey | null;
    collectionMetadata: PublicKey | null;
    tokenMetadataProgram: PublicKey | null;
  },
  pre?: TransactionInstruction[]
): Promise<TransactionInstruction> =>
  program.methods
    .addNftReward({
      amountPerUser: args.amountPerUser,
      availableRewards: args.availableRewards,
      kind: {
        nft: args.kind,
      },
    })
    .accounts(accounts)
    .preInstructions(pre ?? [])
    .instruction();

export const registerMergeApprovalInstruction = async (
  program: Program<Soar>,
  accounts: {
    user: PublicKey;
    playerAccount: PublicKey;
    mergeAccount: PublicKey;
  },
  pre?: TransactionInstruction[]
): Promise<TransactionInstruction> =>
  program.methods
    .approveMerge()
    .accounts(accounts)
    .preInstructions(pre ?? [])
    .instruction();

export const claimFtRewardInstruction = async (
  program: Program<Soar>,
  accounts: {
    user: PublicKey;
    playerAccount: PublicKey;
    game: PublicKey;
    achievement: PublicKey;
    reward: PublicKey;
    playerAchievement: PublicKey;
    sourceTokenAccount: PublicKey;
    userTokenAccount: PublicKey;
    tokenProgram: PublicKey;
  }
): Promise<TransactionInstruction> =>
  program.methods.claimFtReward().accounts(accounts).instruction();

export const claimNftRewardInstruction = async (
  program: Program<Soar>,
  accounts: {
    user: PublicKey;
    playerAccount: PublicKey;
    game: PublicKey;
    achievement: PublicKey;
    reward: PublicKey;
    playerAchievement: PublicKey;
    payer: PublicKey;
    claim: PublicKey;
    newMint: PublicKey;
    newMetadata: PublicKey;
    newMasterEdition: PublicKey;
    mintTo: PublicKey;
    tokenMetadataProgram: PublicKey;
    associatedTokenProgram: PublicKey;
    systemProgram: PublicKey;
    tokenProgram: PublicKey;
    rent: PublicKey;
  },
  pre?: TransactionInstruction[]
): Promise<TransactionInstruction> =>
  program.methods
    .claimNftReward()
    .accounts(accounts)
    .preInstructions(pre ?? [])
    .instruction();

export const registerPlayerEntryInstruction = async (
  program: Program<Soar>,
  accounts: {
    user: PublicKey;
    payer: PublicKey;
    playerAccount: PublicKey;
    newList: PublicKey;
    game: PublicKey;
    leaderboard: PublicKey;
    systemProgram: PublicKey;
  },
  pre?: TransactionInstruction[]
): Promise<TransactionInstruction> =>
  program.methods
    .registerPlayer()
    .accounts(accounts)
    .preInstructions(pre ?? [])
    .instruction();

export const submitScoreInstruction = async (
  program: Program<Soar>,
  args: SubmitScoreArgs,
  accounts: {
    user: PublicKey;
    payer: PublicKey;
    playerAccount: PublicKey;
    authority: PublicKey;
    game: PublicKey;
    leaderboard: PublicKey;
    playerScores: PublicKey;
    topEntries: PublicKey;
    systemProgram: PublicKey;
  },
  pre?: TransactionInstruction[]
): Promise<TransactionInstruction> =>
  program.methods
    .submitScore(args.score)
    .accounts(accounts)
    .preInstructions(pre ?? [])
    .instruction();

export const updateAchievementInstruction = async (
  program: Program<Soar>,
  args: UpdateAchievementArgs,
  accounts: {
    authority: PublicKey;
    game: PublicKey;
    achievement: PublicKey;
  },
  pre?: TransactionInstruction[]
): Promise<TransactionInstruction> =>
  program.methods
    .updateAchievement(args.newTitle, args.newDescription, args.newNftMeta)
    .accounts(accounts)
    .preInstructions(pre ?? [])
    .instruction();

export const unlockPlayerAchievementInstruction = async (
  program: Program<Soar>,
  accounts: {
    user: PublicKey;
    payer: PublicKey;
    playerAccount: PublicKey;
    playerScores: PublicKey;
    game: PublicKey;
    leaderboard: PublicKey;
    achievement: PublicKey;
    authority: PublicKey;
    playerAchievement: PublicKey;
  },
  pre?: TransactionInstruction[]
): Promise<TransactionInstruction> =>
  program.methods
    .unlockPlayerAchievement()
    .accounts(accounts)
    .preInstructions(pre ?? [])
    .instruction();

export const updateGameInstruction = async (
  program: Program<Soar>,
  args: UpdateGameArgs,
  accounts: {
    payer: PublicKey;
    game: PublicKey;
    authority: PublicKey;
    systemProgram: PublicKey;
  },
  pre?: TransactionInstruction[]
): Promise<TransactionInstruction> =>
  program.methods
    .updateGame(args.newMeta, args.newAuths)
    .accounts(accounts)
    .preInstructions(pre ?? [])
    .instruction();

export const updateLeaderBoardInstruction = async (
  program: Program<Soar>,
  args: UpdateLeaderboardArgs,
  accounts: {
    authority: PublicKey;
    game: PublicKey;
    leaderboard: PublicKey;
  },
  pre?: TransactionInstruction[]
): Promise<TransactionInstruction> => {
  return program.methods
    .updateLeaderboard(args.newDescription, args.newNftMeta)
    .accounts(accounts)
    .preInstructions(pre ?? [])
    .instruction();
};

export const updatePlayerInstruction = async (
  program: Program<Soar>,
  args: UpdatePlayerArgs,
  accounts: {
    user: PublicKey;
    playerAccount: PublicKey;
  },
  pre?: TransactionInstruction[]
): Promise<TransactionInstruction> =>
  program.methods
    .updatePlayer(args.newUsername, args.newNftMeta)
    .accounts(accounts)
    .preInstructions(pre ?? [])
    .instruction();

export const verifyNftRewardInstruction = async (
  program: Program<Soar>,
  accounts: {
    payer: PublicKey;
    user: PublicKey;
    playerAccount: PublicKey;
    achievement: PublicKey;
    game: PublicKey;
    reward: PublicKey;
    playerAchievement: PublicKey;
    mint: PublicKey;
    claim: PublicKey;
    metadataToVerify: PublicKey;
    collectionMint: PublicKey;
    collectionMetadata: PublicKey;
    collectionEdition: PublicKey;
    tokenMetadataProgram: PublicKey;
  },
  pre?: TransactionInstruction[]
): Promise<TransactionInstruction> =>
  program.methods
    .verifyNftReward()
    .accounts(accounts)
    .preInstructions(pre ?? [])
    .instruction();
