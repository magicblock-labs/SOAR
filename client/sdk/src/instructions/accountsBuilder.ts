import { IDL, type Soar } from "../idl/soar";
import { type AnchorProvider, Program } from "@coral-xyz/anchor";
import {
  type PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { TOKEN_METADATA_PROGRAM_ID } from "../constants";
import { Utils } from "../utils";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { AchievementAccount, RewardAccount } from "../state";

export class AccountsBuilder {
  readonly program: Program<Soar>;
  readonly utils: Utils;

  constructor(private readonly provider: AnchorProvider, programId: PublicKey) {
    this.program = new Program<Soar>(IDL, programId, provider);
    this.utils = new Utils(this.program.programId);
  }

  initializeGameAccounts = async (
    game: PublicKey
  ): Promise<{
    creator: PublicKey;
    game: PublicKey;
    systemProgram: PublicKey;
  }> => {
    return {
      creator: this.provider.publicKey,
      game,
      systemProgram: SystemProgram.programId,
    };
  };

  initializePlayerAccounts = async (
    user: PublicKey
  ): Promise<{
    playerAccount: PublicKey;
    user: PublicKey;
    payer: PublicKey;
    systemProgram: PublicKey;
  }> => {
    return {
      playerAccount: this.utils.derivePlayerAddress(user)[0],
      user,
      payer: this.provider.publicKey,
      systemProgram: SystemProgram.programId,
    };
  };

  initiateMergeAccounts = async (
    user: PublicKey,
    mergeAccount: PublicKey
  ): Promise<{
    user: PublicKey;
    payer: PublicKey;
    playerAccount: PublicKey;
    mergeAccount: PublicKey;
    systemProgram: PublicKey;
  }> => {
    return {
      user,
      payer: this.provider.publicKey,
      playerAccount: this.utils.derivePlayerAddress(user)[0],
      mergeAccount,
      systemProgram: SystemProgram.programId,
    };
  };

  addAchievementAccounts = async (
    game: PublicKey,
    authority: PublicKey,
    nextAchievement?: PublicKey
  ): Promise<{
    newAchievement: PublicKey;
    game: PublicKey;
    payer: PublicKey;
    authority: PublicKey;
    systemProgram: PublicKey;
  }> => {
    let newAchievement = nextAchievement;
    if (newAchievement === undefined) {
      const gameAccount = await this.program.account.game.fetch(game);
      const id = gameAccount.achievementCount.addn(1);
      newAchievement = this.utils.deriveAchievementAddress(id, game)[0];
    }

    return {
      newAchievement,
      game,
      payer: this.provider.publicKey,
      authority,
      systemProgram: SystemProgram.programId,
    };
  };

  addLeaderboardAccounts = async (
    game: PublicKey,
    authority: PublicKey,
    nextLeaderboard?: PublicKey,
    nullTopEntries?: boolean
  ): Promise<{
    authority: PublicKey;
    game: PublicKey;
    payer: PublicKey;
    leaderboard: PublicKey;
    topEntries: PublicKey | null;
    systemProgram: PublicKey;
  }> => {
    let newLeaderBoard = nextLeaderboard;
    if (nextLeaderboard !== undefined) {
      newLeaderBoard = nextLeaderboard;
    } else {
      const gameAccount = await this.program.account.game.fetch(game);
      const id = gameAccount.leaderboardCount.addn(1);
      newLeaderBoard = this.utils.deriveLeaderBoardAddress(id, game)[0];
    }

    let topEntries: PublicKey | null;
    if (nullTopEntries !== undefined && nullTopEntries) {
      topEntries = null;
    } else {
      topEntries = this.utils.deriveLeaderTopEntriesAddress(newLeaderBoard)[0];
    }

    return {
      authority,
      game,
      payer: this.provider.publicKey,
      leaderboard: newLeaderBoard,
      topEntries,
      systemProgram: SystemProgram.programId,
    };
  };

  addFtRewardAccounts = async (
    authority: PublicKey,
    newReward: PublicKey,
    achievement: PublicKey,
    sourceTokenAccount: PublicKey,
    tokenAccountOwner: PublicKey,
    mint: PublicKey,
    game?: PublicKey
  ): Promise<{
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
  }> => {
    const gameAddress =
      game ?? (await this.program.account.achievement.fetch(achievement)).game;

    return {
      authority,
      payer: this.provider.publicKey,
      game: gameAddress,
      achievement,
      newReward,
      rewardTokenMint: mint,
      delegateFromTokenAccount: sourceTokenAccount,
      tokenAccountOwner,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    };
  };

  addNftRewardAccounts = async (
    authority: PublicKey,
    newReward: PublicKey,
    achievement: PublicKey,
    collectionMint?: PublicKey,
    collectionUpdateAuthority?: PublicKey,
    game?: PublicKey
  ): Promise<{
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
  }> => {
    const gameAddress =
      game ?? (await this.program.account.achievement.fetch(achievement)).game;

    let collectionMetadata: PublicKey | null = null;
    let metadataProgram: PublicKey | null = null;

    if (collectionMint !== undefined) {
      if (collectionUpdateAuthority === undefined) {
        throw new Error("Collection update authority should be defined");
      }
      
      collectionMetadata = this.utils.deriveMetadataAddress(collectionMint)[0];
      metadataProgram = TOKEN_METADATA_PROGRAM_ID;
    }

    return {
      authority,
      payer: this.provider.publicKey,
      game: gameAddress,
      achievement,
      newReward,
      systemProgram: SystemProgram.programId,
      rewardCollectionMint: collectionMint ?? null,
      collectionUpdateAuth: collectionUpdateAuthority ?? null,
      collectionMetadata,
      tokenMetadataProgram: metadataProgram ?? null,
    };
  };

  registerMergeApprovalAccounts = async (
    user: PublicKey,
    mergeAccount: PublicKey
  ): Promise<{
    user: PublicKey;
    playerAccount: PublicKey;
    mergeAccount: PublicKey;
  }> => {
    return {
      user,
      playerAccount: this.utils.derivePlayerAddress(user)[0],
      mergeAccount,
    };
  };

  claimFtRewardAccounts = async (
    authority: PublicKey,
    achievement: PublicKey,
    user: PublicKey,
    reward?: PublicKey,
    game?: PublicKey
  ): Promise<{
    user: PublicKey;
    authority: PublicKey;
    playerAccount: PublicKey;
    game: PublicKey;
    achievement: PublicKey;
    reward: PublicKey;
    playerAchievement: PublicKey;
    sourceTokenAccount: PublicKey;
    userTokenAccount: PublicKey;
    tokenProgram: PublicKey;
    mint: PublicKey;
  }> => {
    let rewardAddress: PublicKey;
    let gameAddress: PublicKey;

    if (reward === undefined || game === undefined) {
      const account = await this.program.account.achievement.fetch(achievement);
      const achievementAccount = AchievementAccount.fromIdlAccount(
        account,
        achievement
      );
      if (achievementAccount.reward === null) {
        throw new Error("No reward for achievement");
      }

      rewardAddress = achievementAccount.reward;
      gameAddress = achievementAccount.game;
    } else {
      rewardAddress = reward;
      gameAddress = game;
    }

    const playerAccount = this.utils.derivePlayerAddress(user)[0];
    const playerAchievement = this.utils.derivePlayerAchievementAddress(
      user,
      achievement
    )[0];

    const idlAccount = await this.program.account.reward.fetch(rewardAddress);
    const rewardAccount = RewardAccount.fromIdlAccount(
      idlAccount,
      rewardAddress
    );

    if (rewardAccount.FungibleToken === undefined) {
      throw new Error("Not a fungible-token reward");
    }
    const mint = rewardAccount.FungibleToken.mint;

    return {
      user,
      authority,
      playerAccount,
      game: gameAddress,
      achievement,
      reward: rewardAddress,
      playerAchievement,
      sourceTokenAccount: rewardAccount.FungibleToken.account,
      userTokenAccount: this.utils.deriveAssociatedTokenAddress(mint, user),
      tokenProgram: TOKEN_PROGRAM_ID,
      mint,
    };
  };

  claimNftRewardAccounts = async (
    authority: PublicKey,
    achievement: PublicKey,
    mint: PublicKey,
    user: PublicKey,
    reward?: PublicKey,
    game?: PublicKey
  ): Promise<{
    user: PublicKey;
    authority: PublicKey;
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
  }> => {
    let rewardAddress: PublicKey;
    let gameAddress: PublicKey;

    if (reward === undefined || game === undefined) {
      const account = await this.program.account.achievement.fetch(achievement);
      const achievementAccount = AchievementAccount.fromIdlAccount(
        account,
        achievement
      );
      if (achievementAccount.reward === null) {
        throw new Error("No reward for achievement");
      }

      rewardAddress = achievementAccount.reward;
      gameAddress = achievementAccount.game;
    } else {
      rewardAddress = reward;
      gameAddress = game;
    }

    const playerAccount = this.utils.derivePlayerAddress(user)[0];
    const playerAchievement = this.utils.derivePlayerAchievementAddress(
      user,
      achievement
    )[0];

    const metadata = this.utils.deriveMetadataAddress(mint)[0];
    const masterEdition = this.utils.deriveEditionAddress(mint)[0];
    const userAta = this.utils.deriveAssociatedTokenAddress(mint, user);

    const claim = this.utils.deriveNftClaimAddress(rewardAddress, mint)[0];

    return {
      user,
      authority,
      playerAccount,
      game: gameAddress,
      achievement,
      reward: rewardAddress,
      playerAchievement,
      payer: this.provider.publicKey,
      claim,
      newMint: mint,
      newMetadata: metadata,
      newMasterEdition: masterEdition,
      mintTo: userAta,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };
  };

  registerPlayerEntryAccounts = async (
    user: PublicKey,
    leaderboard: PublicKey,
    game?: PublicKey
  ): Promise<{
    user: PublicKey;
    payer: PublicKey;
    playerAccount: PublicKey;
    newList: PublicKey;
    game: PublicKey;
    leaderboard: PublicKey;
    systemProgram: PublicKey;
  }> => {
    const gameAddress =
      game ?? (await this.program.account.leaderBoard.fetch(leaderboard)).game;
    const playerAccount = this.utils.derivePlayerAddress(user)[0];
    const newList = this.utils.derivePlayerScoresListAddress(
      user,
      leaderboard
    )[0];

    return {
      user,
      payer: this.provider.publicKey,
      playerAccount,
      newList,
      game: gameAddress,
      leaderboard,
      systemProgram: SystemProgram.programId,
    };
  };

  submitScoreAccounts = async (
    user: PublicKey,
    authority: PublicKey,
    leaderboard: PublicKey,
    game?: PublicKey
  ): Promise<{
    payer: PublicKey;
    playerAccount: PublicKey;
    authority: PublicKey;
    game: PublicKey;
    leaderboard: PublicKey;
    playerScores: PublicKey;
    topEntries: PublicKey | null;
    systemProgram: PublicKey;
  }> => {
    const leaderboardAccount = await this.program.account.leaderBoard.fetch(leaderboard);
    const gameAddress = game ?? leaderboardAccount.game;
    const playerAccount = this.utils.derivePlayerAddress(user)[0];
    const playerScores = this.utils.derivePlayerScoresListAddress(
      user,
      leaderboard
    )[0];
    const topEntries = leaderboardAccount.topEntries;

    return {
      payer: this.provider.publicKey,
      playerAccount,
      authority,
      game: gameAddress,
      leaderboard,
      playerScores,
      topEntries,
      systemProgram: SystemProgram.programId,
    };
  };

  updateAchievementAccounts = async (
    authority: PublicKey,
    achievement: PublicKey,
    game?: PublicKey
  ): Promise<{
    authority: PublicKey;
    game: PublicKey;
    achievement: PublicKey;
  }> => {
    const gameAddress =
      game ?? (await this.program.account.achievement.fetch(achievement)).game;

    return {
      authority,
      game: gameAddress,
      achievement,
    };
  };

  unlockPlayerAchievementAccounts = async (
    user: PublicKey,
    authority: PublicKey,
    achievement: PublicKey,
    leaderboard: PublicKey,
    game?: PublicKey
  ): Promise<{
    payer: PublicKey;
    playerAccount: PublicKey;
    playerScores: PublicKey;
    game: PublicKey;
    achievement: PublicKey;
    authority: PublicKey;
    playerAchievement: PublicKey;
  }> => {
    const playerAccount = this.utils.derivePlayerAddress(user)[0];

    const gameAddress =
      game ?? (await this.program.account.achievement.fetch(achievement)).game;
    const playerEntryList = this.utils.derivePlayerScoresListAddress(
      user,
      leaderboard
    )[0];
    const newPlayerAchievement = this.utils.derivePlayerAchievementAddress(
      user,
      achievement
    )[0];

    return {
      payer: this.provider.publicKey,
      playerAccount,
      playerScores: playerEntryList,
      game: gameAddress,
      achievement,
      authority,
      playerAchievement: newPlayerAchievement,
    };
  };

  updateGameAccounts = async (
    game: PublicKey,
    authority: PublicKey
  ): Promise<{
    payer: PublicKey;
    game: PublicKey;
    authority: PublicKey;
    systemProgram: PublicKey;
  }> => {
    return {
      payer: this.provider.publicKey,
      game,
      authority,
      systemProgram: SystemProgram.programId,
    };
  };

  updateLeaderboardAccounts = async (
    authority: PublicKey,
    leaderboard: PublicKey,
    game?: PublicKey
  ): Promise<{
    authority: PublicKey;
    game: PublicKey;
    leaderboard: PublicKey;
  }> => {
    const gameAddress =
      game ?? (await this.program.account.leaderBoard.fetch(leaderboard)).game;

    return {
      authority,
      game: gameAddress,
      leaderboard,
    };
  };

  updatePlayerAccounts = async (
    user: PublicKey
  ): Promise<{
    user: PublicKey;
    playerAccount: PublicKey;
  }> => {
    return {
      user,
      playerAccount: this.utils.derivePlayerAddress(user)[0],
    };
  };

  verifyNftRewardAccounts = async (
    user: PublicKey,
    achievement: PublicKey,
    mint: PublicKey,
    reward?: PublicKey,
    game?: PublicKey
  ): Promise<{
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
  }> => {
    let rewardAddress: PublicKey;
    let gameAddress: PublicKey;

    if (reward === undefined || game === undefined) {
      const account = await this.program.account.achievement.fetch(achievement);
      const achievementAccount = AchievementAccount.fromIdlAccount(
        account,
        achievement
      );
      if (achievementAccount.reward === null) {
        throw new Error("No reward for achievement");
      }

      rewardAddress = achievementAccount.reward;
      gameAddress = achievementAccount.game;
    } else {
      rewardAddress = reward;
      gameAddress = game;
    }

    const playerAccount = this.utils.derivePlayerAddress(user)[0];
    const playerAchievement = this.utils.derivePlayerAchievementAddress(
      user,
      achievement
    )[0];

    const claim = this.utils.deriveNftClaimAddress(rewardAddress, mint)[0];
    const metadata = this.utils.deriveMetadataAddress(mint)[0];

    const rewardAccount = RewardAccount.fromIdlAccount(
      await this.program.account.reward.fetch(rewardAddress),
      rewardAddress
    );
    if (
      rewardAccount.NonFungibleToken === undefined ||
      rewardAccount.NonFungibleToken?.collection === null
    ) {
      throw new Error("No collection to verify rewards for.");
    }

    const collectionMint = rewardAccount.NonFungibleToken.collection;
    const collectionMetadata =
      this.utils.deriveMetadataAddress(collectionMint)[0];
    const collectionEdition =
      this.utils.deriveEditionAddress(collectionMint)[0];

    return {
      payer: this.provider.publicKey,
      user,
      playerAccount,
      achievement,
      game: gameAddress,
      reward: rewardAddress,
      playerAchievement,
      mint,
      claim,
      metadataToVerify: metadata,
      collectionMint,
      collectionEdition,
      collectionMetadata,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    };
  };
}
