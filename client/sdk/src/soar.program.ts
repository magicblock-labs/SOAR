import { type AnchorProvider, Program, type Provider } from "@coral-xyz/anchor";
import {
  PublicKey,
  type ConfirmOptions,
  type Connection,
  type GetProgramAccountsFilter,
  type Signer,
  type Transaction,
  type TransactionInstruction,
} from "@solana/web3.js";
import { IDL, type Soar } from "./idl/soar";
import { PROGRAM_ID } from "./constants";
import BN from "bn.js";
import { InstructionBuilder } from "./instructions";
import { Utils } from "./utils";
import { type InstructionResult } from "./types";
import {
  AchievementAccount,
  GameAccount,
  type GameAttributes,
  type GameType,
  type Genre,
  LeaderBoardAccount,
  MergedAccount,
  PlayerAccount,
  PlayerAchievementAccount,
  PlayerScoresListAccount,
  RewardAccount,
  TopEntriesAccount,
} from "./state";
import bs58 from "bs58";
import { createAssociatedTokenAccountIdempotentInstruction } from "@solana/spl-token";
import { GameClient } from "./soar.game";

export class SimpleProvider implements Provider {
  readonly connection: Connection;
  readonly publicKey?: PublicKey;

  constructor(connection: Connection, publicKey?: PublicKey) {
    this.connection = connection;
    this.publicKey = publicKey;
  }
}

export class SoarProgram {
  readonly program: Program<Soar>;
  readonly utils: Utils;
  private readonly builder: InstructionBuilder;

  private constructor(readonly provider: AnchorProvider, programId: PublicKey) {
    this.program = new Program<Soar>(IDL, programId, provider);
    this.utils = new Utils(this.program.programId);
    this.builder = new InstructionBuilder(provider, programId);
  }

  public static getFromConnection(
    connection: Connection,
    defaultPayer: PublicKey,
    programId?: PublicKey
  ): SoarProgram {
    return new SoarProgram(
      new SimpleProvider(connection, defaultPayer) as AnchorProvider,
      programId ?? PROGRAM_ID
    );
  }

  /// Static initializer for a SoarProgram instance.
  public static get(
    provider: AnchorProvider,
    programId?: PublicKey
  ): SoarProgram {
    return new SoarProgram(provider, programId ?? PROGRAM_ID);
  }

  /**
   * Initialize a new Game account with the set parameters.
   */
  public async initializeNewGame(
    newGame: PublicKey | string,
    title: string,
    description: string,
    genre: Genre,
    gameType: GameType,
    nftMeta: PublicKey | string,
    authorities: PublicKey[]
  ): Promise<InstructionResult.InitializeGame> {
    this.builder.clean();
    newGame = this.getPublicKey(newGame);
    nftMeta = this.getPublicKey(nftMeta);
    const step = await this.builder.initGameStep(
      {
        gameMeta: {
          title,
          description,
          genre,
          gameType,
          nftMeta,
        },
        authorities,
      },
      newGame
    );

    return {
      transaction: step[0].build(),
      newGame: step[1].game,
    };
  }

  /**
   * Initialize a player account required to perform game-related actions.
   */
  public async initializePlayerAccount(
    user: PublicKey | string,
    username: string,
    nftMeta: PublicKey | string
  ): Promise<InstructionResult.InitializePlayer> {
    this.builder.clean();
    user = this.getPublicKey(user);
    nftMeta = this.getPublicKey(nftMeta);
    const step = await this.builder.initPlayerStep(
      {
        username,
        nftMeta,
      },
      user
    );

    return {
      transaction: step[0].build(),
      newPlayer: step[1].playerAccount,
    };
  }

  /**
   * Update a game's attributes.
   */
  public async updateGameAccount(
    game: PublicKey | string,
    authority: PublicKey | string,
    newMeta?: GameAttributes,
    newAuths?: PublicKey[]
  ): Promise<InstructionResult.UpdateGame> {
    game = this.getPublicKey(game);
    authority = this.getPublicKey(authority);
    if (newMeta === undefined && newAuths === undefined) {
      throw new Error(
        "Expected at least one of newMeta and newAuths to be defined"
      );
    }

    this.builder.clean();
    const step = await this.builder.updateGameStep(
      {
        newMeta: newMeta ?? null,
        newAuths: newAuths ?? null,
      },
      game,
      authority
    );

    return { transaction: step[0].build() };
  }

  /**
   * Update a player account's attributes.
   */
  public async updatePlayerAccount(
    user: PublicKey | string,
    newUsername?: string,
    newNftMeta?: PublicKey | string
  ): Promise<InstructionResult.UpdatePlayer> {
    user = this.getPublicKey(user);
    newNftMeta = this.getNullablePublicKey(newNftMeta);
    if (newUsername === undefined && newNftMeta === undefined) {
      throw new Error(
        "Expected one of newUsername and newNftMeta to be defined"
      );
    }
    this.builder.clean();

    const step = await this.builder.updatePlayerStep(
      {
        newUsername: newUsername ?? null,
        newNftMeta: newNftMeta ?? null,
      },
      user
    );

    return { transaction: step[0].build() };
  }

  /**
   * Initiate an action to merge multiple player-accounts as belonging to a
   * single user.
   */
  public async initiateMerge(
    user: PublicKey | string,
    newMergeAccount: PublicKey | string,
    playerAccountKeys: PublicKey[]
  ): Promise<InstructionResult.InitiateMerge> {
    this.builder.clean();
    user = this.getPublicKey(user);
    newMergeAccount = this.getPublicKey(newMergeAccount);

    const step = await this.builder.initMergeStep(
      {
        keys: playerAccountKeys,
      },
      user,
      newMergeAccount
    );

    return {
      newMerge: newMergeAccount,
      transaction: step[0].build(),
    };
  }

  /** Mark approval for a merge action. */
  public async registerMergeApproval(
    user: PublicKey | string,
    mergeAccount: PublicKey | string
  ): Promise<InstructionResult.RegisterMergeApproval> {
    this.builder.clean();
    user = this.getPublicKey(user);
    mergeAccount = this.getPublicKey(mergeAccount);

    const step = await this.builder.registerMergeApprovalStep(
      user,
      mergeAccount
    );

    return { transaction: step[0].build() };
  }

  /** Add a new achievement for a Game. */
  public async addNewGameAchievement(
    gameAddress: PublicKey | string,
    authority: PublicKey | string,
    title: string,
    description: string,
    nftMeta: PublicKey | string
  ): Promise<InstructionResult.AddGameAchievement> {
    this.builder.clean();
    gameAddress = this.getPublicKey(gameAddress);
    authority = this.getPublicKey(authority);
    nftMeta = this.getPublicKey(nftMeta);

    const step = await this.builder.addAchievementStep(
      {
        title,
        description,
        nftMeta,
      },
      gameAddress,
      authority
    );

    return {
      newAchievement: step[1].newAchievement,
      transaction: step[0].build(),
    };
  }

  /** Add a new leaderboard for a Game. */
  public async addNewGameLeaderBoard(
    gameAddress: PublicKey | string,
    authority: PublicKey | string,
    description: string,
    nftMeta: PublicKey | string,
    scoresToRetain: number,
    isAscending: boolean,
    decimals?: number,
    minScore?: BN,
    maxScore?: BN,
    allowMultipleScores?: boolean
  ): Promise<InstructionResult.AddLeaderBoard> {
    this.builder.clean();
    gameAddress = this.getPublicKey(gameAddress);
    authority = this.getPublicKey(authority);
    nftMeta = this.getPublicKey(nftMeta);

    const step = await this.builder.addLeaderBoardStep(
      {
        description,
        nftMeta,
        scoresToRetain,
        isAscending,
        decimals: decimals ?? null,
        minScore: minScore ?? null,
        maxScore: maxScore ?? null,
        allowMultipleScores: allowMultipleScores ?? false,
      },
      gameAddress,
      authority
    );

    return {
      newLeaderBoard: step[1].leaderboard,
      topEntries: step[1].topEntries,
      transaction: step[0].build(),
    };
  }

  /** Update a leaderboard. */
  public async updateGameLeaderboard(
    authority: PublicKey | string,
    leaderboard: PublicKey | string,
    newDescription?: string,
    newNftMeta?: PublicKey | string,
    newMinScore?: BN,
    newMaxScore?: BN,
    newIsAscending?: boolean,
    newAllowMultipleScores?: boolean,
    topEntries?: PublicKey | string
  ): Promise<InstructionResult.UpdateLeaderboard> {
    this.builder.clean();
    authority = this.getPublicKey(authority);
    leaderboard = this.getPublicKey(leaderboard);
    newNftMeta = this.getNullablePublicKey(newNftMeta);
    topEntries = this.getNullablePublicKey(topEntries);
    if (newDescription === undefined && newNftMeta === undefined) {
      throw new Error(
        "One of newDescription or newNftMeta is expected to be defined"
      );
    }

    const step = await this.builder.updateLeaderboardStep(
      {
        newDescription: newDescription ?? null,
        newNftMeta: newNftMeta ?? null,
        newMinScore: newMinScore ?? null,
        newMaxScore: newMaxScore ?? null,
        newIsAscending: newIsAscending ?? null,
        newAllowMultipleScores: newAllowMultipleScores ?? null,
      },
      authority,
      leaderboard,
      undefined,
      topEntries ?? undefined
    );

    return { transaction: step[0].build() };
  }

  /** Register a player to a particular leaderboard. */
  public async registerPlayerEntryForLeaderBoard(
    user: PublicKey | string,
    leaderboard: PublicKey | string
  ): Promise<InstructionResult.RegisterPlayerEntry> {
    this.builder.clean();
    user = this.getPublicKey(user);
    leaderboard = this.getPublicKey(leaderboard);

    const step = await this.builder.registerPlayerEntryStep(user, leaderboard);

    return { newList: step[1].newList, transaction: step[0].build() };
  }

  /** Submit a player's score to a leaderboard they're registered to. */
  public async submitScoreToLeaderBoard(
    user: PublicKey | string,
    authority: PublicKey | string,
    leaderboard: PublicKey | string,
    score: BN | number
  ): Promise<InstructionResult.SubmitScore> {
    this.builder.clean();
    if (typeof score === "number") {
      score = new BN(score);
    }
    user = this.getPublicKey(user);
    authority = this.getPublicKey(authority);
    leaderboard = this.getPublicKey(leaderboard);

    const step = await this.builder.submitScoreStep(
      {
        score,
      },
      user,
      authority,
      leaderboard
    );

    return { transaction: step[0].build() };
  }

  /** Update an achievement's details. */
  public async updateGameAchievement(
    authority: PublicKey | string,
    achievement: PublicKey | string,
    newTitle?: string,
    newDescription?: string,
    newNftMeta?: PublicKey | string
  ): Promise<InstructionResult.UpdateAchievement> {
    this.builder.clean();
    authority = this.getPublicKey(authority);
    achievement = this.getPublicKey(achievement);
    newNftMeta = this.getNullablePublicKey(newNftMeta);

    if (
      newTitle === undefined &&
      newDescription === undefined &&
      newNftMeta === undefined
    ) {
      throw new Error("At least one updated value expected to be specified");
    }

    const step = await this.builder.updateAchievementStep(
      {
        newTitle: newTitle ?? null,
        newDescription: newDescription ?? null,
        newNftMeta: newNftMeta ?? null,
      },
      authority,
      achievement
    );

    return { transaction: step[0].build() };
  }

  /** Unlock an achievement for a player. */
  public async unlockPlayerAchievement(
    user: PublicKey | string,
    authority: PublicKey | string,
    achievement: PublicKey | string,
    leaderboard: PublicKey | string,
    game?: PublicKey | string
  ): Promise<InstructionResult.UnlockPlayerAchievement> {
    this.builder.clean();
    user = this.getPublicKey(user);
    authority = this.getPublicKey(authority);
    achievement = this.getPublicKey(achievement);
    leaderboard = this.getPublicKey(leaderboard);
    game = this.getNullablePublicKey(game);

    const step = await this.builder.unlockPlayerAchievementStep(
      user,
      authority,
      achievement,
      leaderboard
    );

    return {
      newPlayerAchievement: step[1].playerAchievement,
      transaction: step[0].build(),
    };
  }

  /** Add a fungible token reward for unlocking an achievement. */
  public async addFungibleReward(
    authority: PublicKey | string,
    newReward: PublicKey | string,
    achievement: PublicKey | string,
    amountPerUser: BN,
    availableRewards: BN,
    initialDelegation: BN,
    mint: PublicKey,
    sourceTokenAccount: PublicKey | string,
    tokenAccountOwner: PublicKey | string
  ): Promise<InstructionResult.AddReward> {
    this.builder.clean();
    authority = this.getPublicKey(authority);
    newReward = this.getPublicKey(newReward);
    achievement = this.getPublicKey(achievement);
    sourceTokenAccount = this.getPublicKey(sourceTokenAccount);
    tokenAccountOwner = this.getPublicKey(tokenAccountOwner);

    const step = await this.builder.addFungibleRewardStep(
      {
        availableRewards,
        kind: {
          deposit: initialDelegation,
          amount: amountPerUser,
        },
      },
      authority,
      newReward,
      achievement,
      sourceTokenAccount,
      tokenAccountOwner,
      mint
    );

    const prev = await this.fetchAchievementAccount(achievement).then(
      (res) => res.reward
    );
    return {
      oldReward: prev,
      newReward,
      transaction: step[0].build(),
    };
  }

  /** Add a non-fungible token reward for unlocking an achievement. */
  public async addNonFungibleReward(
    authority: PublicKey | string,
    newReward: PublicKey | string,
    achievement: PublicKey | string,
    availableRewards: BN,
    uri: string,
    name: string,
    symbol: string,
    collectionMint?: PublicKey | string,
    collectionUpdateAuthority?: PublicKey | string
  ): Promise<InstructionResult.AddReward> {
    authority = this.getPublicKey(authority);
    newReward = this.getPublicKey(newReward);
    achievement = this.getPublicKey(achievement);
    collectionMint = this.getNullablePublicKey(collectionMint);
    collectionUpdateAuthority = this.getNullablePublicKey(
      collectionUpdateAuthority
    );
    this.builder.clean();

    if (collectionMint !== undefined) {
      if (collectionUpdateAuthority === undefined) {
        throw new Error("Collection update authority should be defined");
      }
    }

    const step = await this.builder.addNonFungibleRewardStep(
      {
        availableRewards,
        kind: { uri, name, symbol },
      },
      authority,
      newReward,
      achievement,
      collectionMint,
      collectionUpdateAuthority
    );

    const prev = await this.fetchAchievementAccount(achievement).then(
      (res) => res.reward
    );
    return {
      oldReward: prev,
      newReward,
      transaction: step[0].build(),
    };
  }

  /** Claim an non-fungible token reward as a result of unlocking an achievement. */
  public async claimNftReward(
    authority: PublicKey | string,
    achievement: PublicKey | string,
    mint: PublicKey | string,
    user: PublicKey | string
  ): Promise<InstructionResult.ClaimNftReward> {
    authority = this.getPublicKey(authority);
    achievement = this.getPublicKey(achievement);
    mint = this.getPublicKey(mint);
    user = this.getPublicKey(user);
    this.builder.clean();

    const step = await this.builder.claimNftRewardStep(
      authority,
      achievement,
      mint,
      user
    );

    return {
      newMint: mint,
      transaction: step[0].build(),
    };
  }

  /** Claim a fungible-token reward as a result for unlocking an achievement. */
  public async claimFtReward(
    authority: PublicKey | string,
    achievement: PublicKey | string,
    user: PublicKey | string
  ): Promise<InstructionResult.ClaimFtReward> {
    this.builder.clean();
    authority = this.getPublicKey(authority);
    achievement = this.getPublicKey(achievement);
    user = this.getPublicKey(user);

    const accounts = await this.builder.accounts.claimFtRewardAccounts(
      authority,
      achievement,
      user
    );

    const preInstructions: TransactionInstruction[] = [];
    const userAta = this.utils.deriveAssociatedTokenAddress(
      accounts.mint,
      user
    );
    const account = await this.provider.connection.getAccountInfo(userAta);
    if (account === null) {
      preInstructions.push(this.createATA(accounts.mint, user, userAta));
    }

    const step = await this.builder
      .append(preInstructions)
      .claimFtRewardStep(
        authority,
        achievement,
        user,
        accounts.reward,
        accounts.game
      );

    return {
      transaction: step[0].build(),
    };
  }

  /** Verify a minted NFT reward as part of the set collection. */
  public async verifyPlayerNftReward(
    user: PublicKey | string,
    achievement: PublicKey | string,
    mint: PublicKey | string
  ): Promise<InstructionResult.VerifyReward> {
    this.builder.clean();
    user = this.getPublicKey(user);
    achievement = this.getPublicKey(achievement);
    mint = this.getPublicKey(mint);

    const step = await this.builder.verifyPlayerNftRewardStep(
      user,
      achievement,
      mint
    );

    return { transaction: step[0].build() };
  }

  private createATA(
    mint: PublicKey | string,
    owner: PublicKey | string,
    ata: PublicKey | string
  ): TransactionInstruction {
    mint = this.getPublicKey(mint);
    owner = this.getPublicKey(owner);
    ata = this.getPublicKey(ata);
    return createAssociatedTokenAccountIdempotentInstruction(
      this.provider.publicKey,
      ata,
      owner,
      mint
    );
  }

  public async sendAndConfirmTransaction(
    transaction: Transaction,
    signers?: Signer[],
    opts?: ConfirmOptions
  ): Promise<string> {
    return this.provider
      .sendAndConfirm(transaction, signers, opts)
      .catch((e) => {
        throw e;
      });
  }

  public async sendAndConfirmTransactions(
    transactions: Transaction[],
    signers: Signer[][] = [],
    opts?: ConfirmOptions
  ): Promise<string[]> {
    const txesWithSigners = this.utils.zip(transactions, signers, []);
    const txSigs: string[] = [];

    for (const [tx, signers] of txesWithSigners) {
      const txSig = await this.sendAndConfirmTransaction(tx, signers, opts);
      txSigs.push(txSig);
    }

    return txSigs;
  }

  public async newGameClient(gameAddress: PublicKey): Promise<GameClient> {
    return new GameClient(this, gameAddress);
  }

  public async fetchAchievementAccount(
    address: PublicKey
  ): Promise<AchievementAccount> {
    const info = await this.program.account.achievement.fetch(address);
    return AchievementAccount.fromIdlAccount(info, address);
  }

  public async fetchGameAccount(address: PublicKey): Promise<GameAccount> {
    const info = await this.program.account.game.fetch(address);
    return GameAccount.fromIdlAccount(info, address);
  }

  public async fetchLeaderBoardAccount(
    address: PublicKey
  ): Promise<LeaderBoardAccount> {
    const info = await this.program.account.leaderBoard.fetch(address);
    return LeaderBoardAccount.fromIdlAccount(info, address);
  }

  public async fetchLeaderBoardTopEntriesAccount(
    address: PublicKey
  ): Promise<TopEntriesAccount> {
    const info = await this.program.account.leaderTopEntries.fetch(address);
    return TopEntriesAccount.fromIdlAccount(info, address);
  }

  public async fetchMergedAccount(address: PublicKey): Promise<MergedAccount> {
    const info = await this.program.account.merged.fetch(address);
    return MergedAccount.fromIdlAccount(info, address);
  }

  public async fetchPlayerAchievementAccount(
    address: PublicKey
  ): Promise<PlayerAchievementAccount> {
    const info = await this.program.account.playerAchievement.fetch(address);
    return PlayerAchievementAccount.fromIdlAccount(info, address);
  }

  public async fetchPlayerScoresListAccount(
    address: PublicKey
  ): Promise<PlayerScoresListAccount> {
    const info = await this.program.account.playerScoresList.fetch(address);
    return PlayerScoresListAccount.fromIdlAccount(info, address);
  }

  public async fetchPlayerAccount(address: PublicKey): Promise<PlayerAccount> {
    const info = await this.program.account.player.fetch(address);
    return PlayerAccount.fromIdlAccount(info, address);
  }

  public async fetchRewardAccount(address: PublicKey): Promise<RewardAccount> {
    const info = await this.program.account.reward.fetch(address);
    return RewardAccount.fromIdlAccount(info, address);
  }

  public async fetchAllGameAccounts(
    memcmp?: Buffer | GetProgramAccountsFilter[]
  ): Promise<GameAccount[]> {
    const games = await this.program.account.game.all(memcmp);

    return games.map((game) =>
      GameAccount.fromIdlAccount(game.account, game.publicKey)
    );
  }

  public async fetchAllAchievementAccounts(
    memcmp?: Buffer | GetProgramAccountsFilter[]
  ): Promise<AchievementAccount[]> {
    const achievements = await this.program.account.achievement.all(memcmp);

    return achievements.map((achievement) =>
      AchievementAccount.fromIdlAccount(
        achievement.account,
        achievement.publicKey
      )
    );
  }

  public async fetchAllLeaderboardAccounts(
    memcmp?: Buffer | GetProgramAccountsFilter[]
  ): Promise<LeaderBoardAccount[]> {
    const leaderboards = await this.program.account.leaderBoard.all(memcmp);

    return leaderboards.map((leaderboard) =>
      LeaderBoardAccount.fromIdlAccount(
        leaderboard.account,
        leaderboard.publicKey
      )
    );
  }

  public async fetchAllPlayerAccounts(
    memcmp?: Buffer | GetProgramAccountsFilter[]
  ): Promise<PlayerAccount[]> {
    const players = await this.program.account.player.all(memcmp);

    return players.map((player) =>
      PlayerAccount.fromIdlAccount(player.account, player.publicKey)
    );
  }

  public async fetchGameAccountsInfoByGenre(
    genre: string
  ): Promise<GameAccount[]> {
    const games = await this.program.account.game.all([
      {
        memcmp: {
          offset: 8 + 200 + 30,
          bytes: bs58.encode(Buffer.from(genre)),
        },
      },
    ]);
    return games.map((game) =>
      GameAccount.fromIdlAccount(game.account, game.publicKey)
    );
  }

  public async fetchPlayerAchievementInfo(
    user: PublicKey
  ): Promise<PlayerAchievementAccount[]> {
    const player = this.utils.derivePlayerAddress(user)[0];
    const achievements = await this.program.account.playerAchievement.all([
      {
        memcmp: {
          offset: 8,
          bytes: player.toBase58(),
        },
      },
    ]);

    return achievements.map((achievement) =>
      PlayerAchievementAccount.fromIdlAccount(
        achievement.account,
        achievement.publicKey
      )
    );
  }

  private getPublicKey(user: PublicKey | string): PublicKey {
    return user != null && typeof user === "string"
      ? new PublicKey(user)
      : user;
  }

  private getNullablePublicKey(
    user: PublicKey | string | undefined
  ): PublicKey | undefined {
    return user != null && typeof user === "string"
      ? new PublicKey(user)
      : user;
  }
}
