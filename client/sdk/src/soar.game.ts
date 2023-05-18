import { type AnchorProvider, type IdlTypes } from "@coral-xyz/anchor";
import { Keypair, type PublicKey } from "@solana/web3.js";
import { type Soar } from "./idl/soar";
import type BN from "bn.js";
import { type InstructionResult } from "./types";
import { SoarProgram } from "./soar.program";
import {
  type GameType,
  type Genre,
  AchievementAccount,
  GameAccount,
  LeaderBoardAccount,
  PlayerEntryListAccount,
} from "./state";

export class Game {
  readonly soar: SoarProgram;
  address: PublicKey;
  state: GameAccount | null;

  private constructor(address: PublicKey, readonly soarProgram: SoarProgram) {
    this.address = address;
    this.soar = soarProgram;
    this.state = null;
  }

  public static async get(
    address: PublicKey,
    provider: AnchorProvider
  ): Promise<Game> {
    const soarClient = SoarProgram.get(provider);
    const game = new Game(address, soarClient);
    await game.init();
    return game;
  }

  public static async register(
    program: SoarProgram,
    title: string,
    description: string,
    genre: Genre,
    gameType: GameType,
    nftMeta: PublicKey,
    auths: PublicKey[]
  ): Promise<Game> {
    const game = Keypair.generate();
    const { gameAddress, transaction } = await program.initializeNewGame(
      game.publicKey,
      title,
      description,
      genre,
      gameType,
      nftMeta,
      auths
    );

    await program.sendAndConfirmTransaction(transaction, [game]);
    const obj = new Game(gameAddress, program);

    await obj.init();
    return obj;
  }

  public async init(): Promise<void> {
    const account = await this.soar.program.account.game.fetch(this.address);
    this.state = GameAccount.fromIdlAccount(account, this.address);
  }

  public async refresh(): Promise<void> {
    await this.init();
  }

  public async currentLeaderBoardId(): Promise<BN> {
    if (this.state === null) {
      throw new Error("init not called");
    }
    return this.state.leaderboardCount;
  }

  public async currentLeaderBoardAddress(): Promise<PublicKey> {
    const id = await this.currentLeaderBoardId();
    return this.soar.deriveLeaderBoardAddress(id, this.address)[0];
  }

  public async nextLeaderBoardAddress(): Promise<PublicKey> {
    await this.refresh();
    const id = (await this.currentLeaderBoardId()).addn(1);
    return this.soar.deriveLeaderBoardAddress(id, this.address)[0];
  }

  public async update(
    authority: PublicKey,
    newMeta: IdlTypes<Soar>["GameMeta"],
    newAuths: PublicKey[] | null
  ): Promise<InstructionResult.UpdateGame> {
    return this.soar.updateGameAccount(
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
    const next = await this.nextLeaderBoardAddress();
    return this.soar.addNewGameLeaderBoard(
      this.address,
      next,
      authority,
      description,
      nftMeta,
      scoresToRetain,
      scoresOrder,
      decimals,
      minScore,
      maxScore
    );
  }

  public async addAchievement(
    authority: PublicKey,
    title: string,
    description: string,
    nftMeta: PublicKey
  ): Promise<InstructionResult.AddGameAchievement> {
    return this.soar.addNewGameAchievement(
      this.address,
      authority,
      title,
      description,
      nftMeta
    );
  }

  public async registerPlayer(
    user: PublicKey
  ): Promise<InstructionResult.RegisterPlayerEntry> {
    const leaderboard = await this.currentLeaderBoardAddress();
    return this.soar.registerPlayerEntryForLeaderBoard(
      user,
      leaderboard,
      this.address
    );
  }

  public async submitScore(
    user: PublicKey,
    authority: PublicKey,
    score: BN
  ): Promise<InstructionResult.SubmitScore> {
    const leaderboard = await this.currentLeaderBoardAddress();
    return this.soar.submitScoreToLeaderBoard(
      user,
      authority,
      this.address,
      leaderboard,
      score
    );
  }

  public async updateAchievement(
    authority: PublicKey,
    achievement: PublicKey,
    newTitle: string | null,
    newDescription: string | null,
    newNftMeta: PublicKey | null
  ): Promise<InstructionResult.UpdateAchievement> {
    return this.soar.updateGameAchievement(
      authority,
      this.address,
      achievement,
      newTitle,
      newDescription,
      newNftMeta
    );
  }

  public async fetchAllLeaderBoardAccounts(): Promise<LeaderBoardAccount[]> {
    const results = await this.soar.program.account.leaderBoard.all([
      {
        memcmp: {
          offset: 8 + 8,
          bytes: this.address.toBase58(),
        },
      },
    ]);
    return results.map((board) =>
      LeaderBoardAccount.fromIdlAccount(board.account, board.publicKey)
    );
  }

  public async fetchAllAchievements(): Promise<AchievementAccount[]> {
    const results = await this.soar.program.account.achievement.all([
      {
        memcmp: {
          offset: 8,
          bytes: this.address.toBase58(),
        },
      },
    ]);
    return results.map((achievement) =>
      AchievementAccount.fromIdlAccount(
        achievement.account,
        achievement.publicKey
      )
    );
  }

  public async fetchPlayerScores(
    player: PublicKey
  ): Promise<PlayerEntryListAccount[]> {
    const playerInfo = this.soar.derivePlayerAddress(player)[0];
    const leaderboard = await this.currentLeaderBoardAddress();
    const results = await this.soar.program.account.playerEntryList.all([
      {
        memcmp: {
          offset: 8,
          bytes: playerInfo.toBase58(),
        },
      },
      {
        memcmp: {
          offset: 8 + 32,
          bytes: leaderboard.toBase58(),
        },
      },
    ]);

    return results.map((list) =>
      PlayerEntryListAccount.fromIdlAccount(list.account, list.publicKey)
    );
  }
}
