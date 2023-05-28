import { type AnchorProvider, Program } from "@coral-xyz/anchor";
import {
  type ConfirmOptions,
  PublicKey,
  type GetProgramAccountsFilter,
  type Signer,
  type TransactionInstruction,
  type Transaction,
} from "@solana/web3.js";
import { IDL, type Soar } from "./idl/soar";
import { PROGRAM_ID } from "./constants";
import type BN from "bn.js";
import { InstructionBuilder } from "./instructions";
import { Seeds, Utils } from "./utils";
import { type InstructionResult } from "./types";
import {
  type GameType,
  type Genre,
  type GameAttributes,
  GameAccount,
  AchievementAccount,
  PlayerAccount,
  LeaderBoardAccount,
  TopEntriesAccount,
  MergedAccount,
  PlayerScoresListAccount,
  PlayerAchievementAccount,
  RewardAccount,
} from "./state";
import bs58 from "bs58";
import { createAssociatedTokenAccountIdempotentInstruction } from "@solana/spl-token";
import { GameClient } from "./soar.game";

export class SoarProgram {
  readonly program: Program<Soar>;
  readonly utils: Utils;
  private readonly builder: InstructionBuilder;

  private constructor(readonly provider: AnchorProvider) {
    this.program = new Program<Soar>(IDL, PROGRAM_ID, provider);
    this.utils = new Utils(this.program.programId);
    this.builder = new InstructionBuilder(provider);
  }

  public static get(provider: AnchorProvider): SoarProgram {
    const client = new SoarProgram(provider);
    return client;
  }

  public async initializeNewGame(
    newGame: PublicKey,
    title: string,
    description: string,
    genre: Genre,
    gameType: GameType,
    nftMeta: PublicKey,
    authorities: PublicKey[]
  ): Promise<InstructionResult.InitializeGame> {
    this.builder.clean();
    const transaction = await this.builder
      .andInitializeGame(
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
      )
      .then((builder) => builder.build());

    return {
      transaction,
      newGame,
    };
  }

  public async initializePlayerAccount(
    user: PublicKey,
    username: string,
    nftMeta: PublicKey
  ): Promise<InstructionResult.InitializePlayer> {
    this.builder.clean();
    const transaction = await this.builder
      .andInitializePlayer(
        {
          username,
          nftMeta,
        },
        user
      )
      .then((builder) => builder.build());

    return {
      transaction,
      newPlayer: this.derivePlayerAddress(user)[0],
    };
  }

  public async updateGameAccount(
    game: PublicKey,
    authority: PublicKey,
    newMeta?: GameAttributes,
    newAuths?: PublicKey[]
  ): Promise<InstructionResult.UpdateGame> {
    if (newMeta === undefined && newAuths === undefined) {
      throw new Error(
        "Expected at least one of newMeta and newAuths to be defined"
      );
    }

    this.builder.clean();
    const transaction = await this.builder
      .andUpdateGame(
        {
          newMeta: newMeta ?? null,
          newAuths: newAuths ?? null,
        },
        game,
        authority
      )
      .then((builder) => builder.build());

    return { transaction };
  }

  public async updatePlayerAccount(
    user: PublicKey,
    newUsername?: string,
    newNftMeta?: PublicKey
  ): Promise<InstructionResult.UpdatePlayer> {
    if (newUsername === undefined && newNftMeta === undefined) {
      throw new Error(
        "Expected one of newUsername and newNftMeta to be defined"
      );
    }
    this.builder.clean();

    const transaction = await this.builder
      .andUpdatePlayer(
        {
          newUsername: newUsername ?? null,
          newNftMeta: newNftMeta ?? null,
        },
        user
      )
      .then((builder) => builder.build());

    return { transaction };
  }

  public async initiateMerge(
    user: PublicKey,
    newMergeAccount: PublicKey,
    playerAccountKeys: PublicKey[]
  ): Promise<InstructionResult.InitiateMerge> {
    this.builder.clean();

    const transaction = await this.builder
      .andInitiateMerge(
        {
          keys: playerAccountKeys,
        },
        user,
        newMergeAccount
      )
      .then((builder) => builder.build());

    return {
      newMerge: newMergeAccount,
      transaction,
    };
  }

  public async registerMergeApproval(
    user: PublicKey,
    mergeAccount: PublicKey
  ): Promise<InstructionResult.RegisterMergeApproval> {
    this.builder.clean();

    const transaction = await this.builder
      .andRegisterMergeApproval(user, mergeAccount)
      .then((builder) => builder.build());

    return { transaction };
  }

  public async addNewGameAchievement(
    gameAddress: PublicKey,
    authority: PublicKey,
    title: string,
    description: string,
    nftMeta: PublicKey
  ): Promise<InstructionResult.AddGameAchievement> {
    this.builder.clean();

    const account = await this.fetchGameAccount(gameAddress);
    const newAchievement = this.deriveAchievementAddress(
      account.achievementCount.addn(1),
      gameAddress
    )[0];

    const transaction = await this.builder
      .andAddAchievement(
        {
          title,
          description,
          nftMeta,
        },
        gameAddress,
        authority,
        newAchievement
      )
      .then((builder) => builder.build());

    return { newAchievement, transaction };
  }

  public async addNewGameLeaderBoard(
    gameAddress: PublicKey,
    authority: PublicKey,
    description: string,
    nftMeta: PublicKey,
    scoresToRetain: number,
    scoresOrder: boolean,
    decimals?: number,
    minScore?: BN,
    maxScore?: BN
  ): Promise<InstructionResult.AddLeaderBoard> {
    this.builder.clean();

    const gameAccount = await this.fetchGameAccount(gameAddress);
    const id = gameAccount.leaderboardCount.addn(1);
    const newLeaderBoard = this.deriveLeaderBoardAddress(id, gameAddress)[0];
    const topEntries = this.deriveLeaderTopEntriesAddress(newLeaderBoard)[0];

    const transaction = await this.builder
      .andAddLeaderBoard(
        {
          description,
          nftMeta,
          scoresToRetain,
          scoresOrder,
          decimals: decimals ?? null,
          minScore: minScore ?? null,
          maxScore: maxScore ?? null,
        },
        gameAddress,
        authority
      )
      .then((builder) => builder.build());

    return { newLeaderBoard, topEntries, transaction };
  }

  public async updateGameLeaderboard(
    authority: PublicKey,
    leaderboard: PublicKey,
    newDescription?: string,
    newNftMeta?: PublicKey
  ): Promise<InstructionResult.UpdateLeaderboard> {
    this.builder.clean();
    if (newDescription === undefined && newNftMeta === undefined) {
      throw new Error(
        "One of newDescription or newNftMeta is expected to be defined"
      );
    }
    const game = await this.fetchLeaderBoardAccount(leaderboard).then(
      (lb) => lb.game
    );

    const transaction = await this.builder
      .andUpdateLeaderboard(
        {
          newDescription: newDescription ?? null,
          newNftMeta: newNftMeta ?? null,
        },
        authority,
        leaderboard,
        game
      )
      .then((builder) => builder.build());

    return { transaction };
  }

  public async registerPlayerEntryForLeaderBoard(
    user: PublicKey,
    leaderboard: PublicKey
  ): Promise<InstructionResult.RegisterPlayerEntry> {
    this.builder.clean();

    const game = await this.fetchLeaderBoardAccount(leaderboard).then(
      (leaderboard) => leaderboard.game
    );

    const transaction = await this.builder
      .andRegisterPlayerEntry(user, leaderboard, game)
      .then((builder) => builder.build());

    const newList = this.utils.derivePlayerScoresListAddress(
      user,
      leaderboard
    )[0];
    return { newList, transaction };
  }

  public async submitScoreToLeaderBoard(
    user: PublicKey,
    authority: PublicKey,
    leaderboard: PublicKey,
    score: BN
  ): Promise<InstructionResult.SubmitScore> {
    this.builder.clean();

    const transaction = await this.builder
      .andSubmitScore(
        {
          score,
        },
        user,
        authority,
        leaderboard
      )
      .then((builder) => builder.build());

    return { transaction };
  }

  public async updateGameAchievement(
    authority: PublicKey,
    achievement: PublicKey,
    newTitle?: string,
    newDescription?: string,
    newNftMeta?: PublicKey
  ): Promise<InstructionResult.UpdateAchievement> {
    this.builder.clean();

    if (
      newTitle === undefined &&
      newDescription === undefined &&
      newNftMeta === undefined
    ) {
      throw new Error("At least one updated value expected to be specified");
    }

    const transaction = await this.builder
      .andUpdateAchievement(
        {
          newTitle: newTitle ?? null,
          newDescription: newDescription ?? null,
          newNftMeta: newNftMeta ?? null,
        },
        authority,
        achievement
      )
      .then((builder) => builder.build());

    return { transaction };
  }

  public async unlockPlayerAchievement(
    user: PublicKey,
    authority: PublicKey,
    achievement: PublicKey,
    leaderboard: PublicKey,
    game?: PublicKey
  ): Promise<InstructionResult.UnlockPlayerAchievement> {
    this.builder.clean();

    const transaction = await this.builder
      .andUnlockPlayerAchievement(user, authority, achievement, leaderboard)
      .then((builder) => builder.build());

    const newPlayerAchievement = this.derivePlayerAchievementAddress(
      user,
      achievement
    )[0];

    return {
      newPlayerAchievement,
      transaction,
    };
  }

  public async addFungibleReward(
    authority: PublicKey,
    newReward: PublicKey,
    achievement: PublicKey,
    amountPerUser: BN,
    availableRewards: BN,
    initialDelegation: BN,
    mint: PublicKey,
    sourceTokenAccount: PublicKey,
    tokenAccountOwner: PublicKey
  ): Promise<InstructionResult.AddReward> {
    this.builder.clean();

    const transaction = await this.builder
      .andAddFungibleReward(
        {
          amountPerUser,
          availableRewards,
          kind: {
            deposit: initialDelegation,
          },
        },
        authority,
        newReward,
        achievement,
        sourceTokenAccount,
        tokenAccountOwner,
        mint
      )
      .then((builder) => builder.build());

    const prev = await this.fetchAchievementAccount(achievement).then(
      (res) => res.reward
    );
    return {
      oldReward: prev,
      newReward,
      transaction,
    };
  }

  public async addNonFungibleReward(
    authority: PublicKey,
    newReward: PublicKey,
    achievement: PublicKey,
    amountPerUser: BN,
    availableRewards: BN,
    uri: string,
    name: string,
    symbol: string,
    collectionMint?: PublicKey,
    collectionUpdateAuthority?: PublicKey
  ): Promise<InstructionResult.AddReward> {
    this.builder.clean();

    if (collectionMint !== undefined) {
      if (collectionUpdateAuthority === undefined) {
        throw new Error("Collection update authority should be defined");
      }
    }

    const transaction = await this.builder
      .andAddNonFungibleReward(
        {
          amountPerUser,
          availableRewards,
          kind: { uri, name, symbol },
        },
        authority,
        newReward,
        achievement,
        collectionMint,
        collectionUpdateAuthority
      )
      .then((builder) => builder.build());

    const prev = await this.fetchAchievementAccount(achievement).then(
      (res) => res.reward
    );
    return {
      oldReward: prev,
      newReward,
      transaction,
    };
  }

  public async claimNftReward(
    achievement: PublicKey,
    mint: PublicKey,
    user: PublicKey
  ): Promise<InstructionResult.ClaimNftReward> {
    this.builder.clean();

    const transaction = await this.builder
      .andClaimNftReward(achievement, mint, user)
      .then((builder) => builder.build());

    return {
      newMint: mint,
      transaction,
    };
  }

  public async claimFtReward(
    achievement: PublicKey,
    user: PublicKey
  ): Promise<InstructionResult.ClaimFtReward> {
    this.builder.clean();

    const achievementAccount = await this.fetchAchievementAccount(achievement);
    const rewardAddress = achievementAccount.reward;
    if (rewardAddress === null) {
      throw new Error("No reward for achievement");
    }

    const rewardAccount = await this.fetchRewardAccount(rewardAddress);
    if (rewardAccount.FungibleToken === undefined) {
      throw new Error("Not a fungible-token reward");
    }
    const mint = rewardAccount.FungibleToken.mint;

    const pre = [];
    const userAta = this.utils.deriveAssociatedTokenAddress(mint, user);
    const account = await this.provider.connection.getAccountInfo(userAta);
    if (account === null) {
      pre.push(this.createATA(mint, user, userAta));
    }

    const transaction = await this.builder
      .append(pre)
      .andClaimFtReward(
        achievement,
        user,
        rewardAddress,
        achievementAccount.game
      )
      .then((builder) => builder.build());

    return {
      transaction,
    };
  }

  public async verifyPlayerNftReward(
    user: PublicKey,
    achievement: PublicKey,
    mint: PublicKey
  ): Promise<InstructionResult.VerifyReward> {
    this.builder.clean();

    const transaction = await this.builder
      .andVerifyPlayerNftReward(user, achievement, mint)
      .then((builder) => builder.build());

    return { transaction };
  }

  private createATA(
    mint: PublicKey,
    owner: PublicKey,
    ata: PublicKey
  ): TransactionInstruction {
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

  public deriveLeaderBoardAddress(
    id: BN,
    game: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(Seeds.LEADER), game.toBuffer(), id.toBuffer("le", 8)],
      this.program.programId
    );
  }

  public deriveLeaderTopEntriesAddress(
    leaderboard: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(Seeds.LEADER_TOP_ENTRIES), leaderboard.toBuffer()],
      this.program.programId
    );
  }

  public deriveAchievementAddress(
    id: BN,
    game: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(Seeds.ACHIEVEMENT), game.toBuffer(), id.toBuffer("le", 8)],
      this.program.programId
    );
  }

  public derivePlayerAddress(user: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(Seeds.PLAYER), user.toBuffer()],
      this.program.programId
    );
  }

  public derivePlayerEntryListAddress(
    user: PublicKey,
    leaderboard: PublicKey
  ): [PublicKey, number] {
    const player = this.derivePlayerAddress(user)[0];
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(Seeds.PLAYER_SCORES),
        player.toBuffer(),
        leaderboard.toBuffer(),
      ],
      this.program.programId
    );
  }

  public derivePlayerAchievementAddress(
    user: PublicKey,
    achievement: PublicKey
  ): [PublicKey, number] {
    const player = this.derivePlayerAddress(user)[0];
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(Seeds.PLAYER_ACHIEVEMENT),
        player.toBuffer(),
        achievement.toBuffer(),
      ],
      this.program.programId
    );
  }

  public deriveNftClaimAddress(
    reward: PublicKey,
    mint: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(Seeds.NFT_CLAIM), reward.toBuffer(), mint.toBuffer()],
      this.program.programId
    );
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
    const achievements = await this.program.account.achievement.all(memcmp);

    return achievements.map((achievement) =>
      LeaderBoardAccount.fromIdlAccount(
        achievement.account,
        achievement.publicKey
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

  public async fetchUserAchievementInfo(
    user: PublicKey
  ): Promise<PlayerAchievementAccount[]> {
    const player = this.derivePlayerAddress(user)[0];
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
}
