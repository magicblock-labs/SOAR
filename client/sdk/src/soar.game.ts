import { Keypair, type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlTypes } from "@coral-xyz/anchor";
import { type Soar } from "./idl/soar";
import { type SoarProgram } from "./soar.program";
import { type InstructionResult } from "./types";
import {
  GameAccount,
  type Genre,
  type GameType,
  type AchievementAccount,
  type LeaderBoardAccount,
} from "./state";

export class GameClient {
  program: SoarProgram;
  address: PublicKey;
  account: GameAccount | undefined;

  constructor(program: SoarProgram, address: PublicKey, account?: GameAccount) {
    this.address = address;
    this.program = program;
    this.account = account;
  }

  public static async register(
    program: SoarProgram,
    title: string,
    description: string,
    genre: Genre,
    gameType: GameType,
    nftMeta: PublicKey,
    auths: PublicKey[]
  ): Promise<GameClient> {
    const game = Keypair.generate();

    const { newGame, transaction } = await program.initializeNewGame(
      game.publicKey,
      title,
      description,
      genre,
      gameType,
      nftMeta,
      auths
    );

    await program.sendAndConfirmTransaction(transaction, [game]);
    const client = new GameClient(program, newGame);

    await client.init();
    return client;
  }

  public async init(): Promise<void> {
    const account = await this.program.fetchGameAccount(this.address);
    this.account = GameAccount.fromIdlAccount(account, this.address);
  }

  public async refresh(): Promise<void> {
    await this.init();
  }

  currentLeaderBoardAddress = (): PublicKey => {
    if (this.account === undefined) {
      throw new Error("init not called");
    }
    return this.program.deriveLeaderBoardAddress(
      this.account.leaderboardCount,
      this.address
    )[0];
  };

  nextLeaderBoardAddress = (): PublicKey => {
    if (this.account === undefined) {
      throw new Error("init not called");
    }
    const nextId = this.account.leaderboardCount.addn(1);
    return this.program.deriveLeaderBoardAddress(nextId, this.address)[0];
  };

  currentAchievementAddress = (): PublicKey => {
    if (this.account === undefined) {
      throw new Error("init not called");
    }
    return this.program.deriveAchievementAddress(
      this.account.achievementCount,
      this.address
    )[0];
  };

  nextAchievementAddress = (): PublicKey => {
    if (this.account === undefined) {
      throw new Error("init not called");
    }
    const nextId = this.account.achievementCount.addn(1);
    return this.program.deriveAchievementAddress(nextId, this.address)[0];
  };

  public async update(
    authority: PublicKey,
    newMeta: IdlTypes<Soar>["GameMeta"],
    newAuths: PublicKey[] | null
  ): Promise<InstructionResult.UpdateGame> {
    return this.program.updateGameAccount(
      this.address,
      authority,
      newMeta,
      newAuths
    );
  }

  public async addLeaderBoard(
    authority: PublicKey,
    description: string,
    nftMeta: PublicKey,
    scoresToRetain: number | null,
    scoresOrder: boolean | null,
    decimals: number | null,
    minScore: BN | null,
    maxScore: BN | null
  ): Promise<InstructionResult.AddLeaderBoard> {
    return this.program.addNewGameLeaderBoard(
      this.address,
      authority,
      description,
      nftMeta,
      scoresToRetain,
      scoresOrder,
      decimals,
      minScore,
      maxScore,
      this.nextLeaderBoardAddress()
    );
  }

  public async addAchievement(
    authority: PublicKey,
    title: string,
    description: string,
    nftMeta: PublicKey
  ): Promise<InstructionResult.AddGameAchievement> {
    return this.program.addNewGameAchievement(
      this.address,
      authority,
      title,
      description,
      nftMeta,
      this.nextAchievementAddress()
    );
  }

  public async registerPlayer(
    user: PublicKey,
    leaderBoard?: PublicKey
  ): Promise<InstructionResult.RegisterPlayerEntry> {
    const leaderboard = leaderBoard ?? this.currentLeaderBoardAddress();
    return this.program.registerPlayerEntryForLeaderBoard(
      user,
      leaderboard,
      this.address
    );
  }

  public async submitScore(
    user: PublicKey,
    authority: PublicKey,
    score: BN,
    leaderBoard?: PublicKey
  ): Promise<InstructionResult.SubmitScore> {
    const leaderboard = leaderBoard ?? this.currentLeaderBoardAddress();
    return this.program.submitScoreToLeaderBoard(
      user,
      authority,
      leaderboard,
      score,
      this.address
    );
  }

  public async updateAchievement(
    authority: PublicKey,
    achievement: PublicKey,
    newTitle: string | null,
    newDescription: string | null,
    newNftMeta: PublicKey | null
  ): Promise<InstructionResult.UpdateAchievement> {
    return this.program.updateGameAchievement(
      authority,
      achievement,
      newTitle,
      newDescription,
      newNftMeta,
      this.address
    );
  }

  public async fetchLeaderBoardAccounts(): Promise<LeaderBoardAccount[]> {
    return this.program.fetchAllLeaderboardAccounts([
      {
        memcmp: {
          offset: 8 + 8,
          bytes: this.address.toBase58(),
        },
      },
    ]);
  }

  public async fetchAchievementAccounts(): Promise<AchievementAccount[]> {
    return this.program.fetchAllAchievementAccounts([
      {
        memcmp: {
          offset: 8,
          bytes: this.address.toBase58(),
        },
      },
    ]);
  }
}
