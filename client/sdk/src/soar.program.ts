import { type AnchorProvider, type IdlTypes, Program } from "@coral-xyz/anchor";
import {
  type AccountMeta,
  type ConfirmOptions,
  Keypair,
  PublicKey,
  type Signer,
  Transaction,
} from "@solana/web3.js";
import { IDL, type Soar } from "./idl/soar";
import { PROGRAM_ID } from "./constants";
import BN from "bn.js";
import {
  addLeaderBoardInstruction,
  addAchievementInstruction,
  createPlayerInstruction,
  initializeGameInstruction,
  mergePlayerAccountsInstruction,
  registerPlayerEntryInstruction,
  submitScoreInstruction,
  updateAchievementInstruction,
  updateGameInstruction,
  updatePlayerInstruction,
} from "./instructions";
import {
  deriveAchievementAddress,
  deriveGameAddress,
  deriveLeaderBoardAddress,
  derivePlayerEntryListAddress,
  derivePlayerInfoAddress,
  zip,
} from "./utils";
import { type InstructionResult } from "./types";
import { Game } from "./soar.game";
import {
  type GameAccountInfo,
  gameInfoFromIdlAccount,
  type PlayerAccountInfo,
  playerInfoFromIdlAccount,
  type PlayerAchievementAccountInfo,
  playerAchievementFromIdlAccount,
} from "./state";
import bs58 from "bs58";

export class SoarProgram {
  readonly program: Program<Soar>;

  private constructor(readonly provider: AnchorProvider) {
    this.program = new Program<Soar>(IDL, PROGRAM_ID, provider);
  }

  public static get(provider: AnchorProvider): SoarProgram {
    const client = new SoarProgram(provider);
    return client;
  }

  public async initializeNewGame(
    title: string,
    description: string,
    genre: string,
    gameType: string,
    nftMeta: PublicKey,
    authorities: PublicKey[]
  ): Promise<InstructionResult.InitializeGame> {
    const transaction = new Transaction();

    const newGameAddress = deriveGameAddress(
      this.provider.publicKey,
      this.program.programId
    )[0];

    const initGame = await initializeGameInstruction(
      this.program,
      newGameAddress,
      this.provider.publicKey,
      title,
      description,
      genre,
      gameType,
      nftMeta,
      authorities
    );

    transaction.add(initGame);

    return {
      gameAddress: newGameAddress,
      transaction,
    };
  }

  public async initializePlayerAccount(
    username: string,
    nftMeta: PublicKey
  ): Promise<InstructionResult.CreatePlayer> {
    const transaction = new Transaction();
    const newPlayer = derivePlayerInfoAddress(
      this.provider.publicKey,
      this.program.programId
    )[0];

    const initPlayer = await createPlayerInstruction(
      this.program,
      newPlayer,
      this.provider.publicKey,
      username,
      nftMeta
    );
    transaction.add(initPlayer);

    return {
      newPlayer,
      transaction,
    };
  }

  public async updateGameAccount(
    game: PublicKey,
    authority: PublicKey,
    newMeta: IdlTypes<Soar>["GameMeta"],
    newAuths: PublicKey[] | null
  ): Promise<Transaction> {
    const transaction = new Transaction();

    const update = await updateGameInstruction(
      this.program,
      this.provider.publicKey,
      game,
      authority,
      newMeta,
      newAuths
    );

    return transaction.add(update);
  }

  public async updatePlayerAccount(
    updatedUsername: string | null,
    updatedNftMeta: PublicKey | null
  ): Promise<InstructionResult.UpdatePlayer> {
    const transaction = new Transaction();
    const playerInfo = derivePlayerInfoAddress(
      this.provider.publicKey,
      this.program.programId
    )[0];

    const update = await updatePlayerInstruction(
      this.program,
      this.provider.publicKey,
      playerInfo,
      updatedUsername,
      updatedNftMeta
    );
    transaction.add(update);

    return { transaction };
  }

  public async mergePlayerAccounts(
    keys: PublicKey[]
  ): Promise<InstructionResult.MergePlayerAccounts> {
    const transaction = new Transaction();

    const playerInfo = derivePlayerInfoAddress(
      this.provider.publicKey,
      this.program.programId
    )[0];
    const accounts = new Array<AccountMeta>();
    let hint = 0;
    for (const key of keys) {
      const playerInfo = derivePlayerInfoAddress(
        key,
        this.program.programId
      )[0];

      const keyMeta: AccountMeta = {
        pubkey: key,
        isSigner: true,
        isWritable: false,
      };
      const infoMeta: AccountMeta = {
        pubkey: playerInfo,
        isSigner: false,
        isWritable: true,
      };

      accounts.push(keyMeta);
      accounts.push(infoMeta);
      hint += 1;
    }

    const mergeAccount = Keypair.generate();

    const merge = await mergePlayerAccountsInstruction(
      this.program,
      new BN(hint),
      this.provider.publicKey,
      playerInfo,
      mergeAccount,
      accounts
    );

    return {
      mergeAccount: mergeAccount.publicKey,
      transaction: transaction.add(merge),
    };
  }

  public async addNewGameAchievement(
    game: PublicKey,
    authority: PublicKey,
    title: string,
    description: string,
    nftMeta: PublicKey
  ): Promise<InstructionResult.AddGameAchievement> {
    const transaction = new Transaction();
    const newAchievement = deriveAchievementAddress(
      game,
      title,
      this.program.programId
    )[0];

    const addAchievement = await addAchievementInstruction(
      this.program,
      newAchievement,
      game,
      this.provider.publicKey,
      authority,
      title,
      description,
      nftMeta
    );
    transaction.add(addAchievement);

    return { newAchievement, transaction };
  }

  public async addNewGameLeaderBoard(
    gameAddress: PublicKey,
    leaderboard: PublicKey | null,
    authority: PublicKey,
    description: string,
    nftMeta: PublicKey
  ): Promise<InstructionResult.AddLeaderBoard> {
    const transaction = new Transaction();

    let newLeaderBoard: PublicKey;
    if (leaderboard !== null) {
      newLeaderBoard = leaderboard;
    } else {
      const gameAccount = await this.program.account.game.fetch(gameAddress);
      const id = (gameAccount.leaderboard as any as BN).addn(1);
      newLeaderBoard = deriveLeaderBoardAddress(
        id,
        gameAddress,
        this.program.programId
      )[0];
    }

    const addBoard = await addLeaderBoardInstruction(
      this.program,
      newLeaderBoard,
      this.provider.publicKey,
      gameAddress,
      authority,
      description,
      nftMeta
    );
    transaction.add(addBoard);

    return { newLeaderBoard, transaction };
  }

  public async registerPlayerEntryForLeaderBoard(
    leaderboard: PublicKey,
    game: PublicKey | null,
    leaderboardAddress: PublicKey
  ): Promise<InstructionResult.RegisterPlayerEntry> {
    const transaction = new Transaction();

    const gameAddress =
      game ?? (await this.program.account.leaderBoard.fetch(leaderboard)).game;

    const playerInfo = derivePlayerInfoAddress(
      this.provider.publicKey,
      this.program.programId
    )[0];
    const newList = derivePlayerEntryListAddress(
      playerInfo,
      leaderboardAddress,
      this.program.programId
    )[0];

    const register = await registerPlayerEntryInstruction(
      this.program,
      this.provider.publicKey,
      playerInfo,
      newList,
      gameAddress,
      leaderboardAddress
    );
    transaction.add(register);

    return { newList, transaction };
  }

  public async submitScoreToLeaderBoard(
    authority: PublicKey,
    game: PublicKey | null,
    leaderboard: PublicKey,
    score: BN,
    rank: BN | null
  ): Promise<InstructionResult.SubmitScore> {
    const transaction = new Transaction();

    const gameAddress =
      game ?? (await this.program.account.leaderBoard.fetch(leaderboard)).game;

    // TODO: Add a pre-instruction that registers the player to the current leaderboard if
    // they aren't already registered?
    const playerInfo = derivePlayerInfoAddress(
      this.provider.publicKey,
      this.program.programId
    )[0];
    const playerEntryList = derivePlayerEntryListAddress(
      playerInfo,
      leaderboard,
      this.program.programId
    )[0];

    const submit = await submitScoreInstruction(
      this.program,
      this.provider.publicKey,
      playerInfo,
      authority,
      gameAddress,
      leaderboard,
      playerEntryList,
      score,
      rank
    );
    transaction.add(submit);

    return { transaction };
  }

  public async updateGameAchievement(
    authority: PublicKey,
    game: PublicKey | null,
    achievement: PublicKey,
    newTitle: string | null,
    newDescription: string | null,
    newNftMeta: PublicKey | null
  ): Promise<InstructionResult.UpdateAchievement> {
    const transaction = new Transaction();

    const gameAddress =
      game ?? (await this.program.account.achievement.fetch(achievement)).game;

    const update = await updateAchievementInstruction(
      this.program,
      gameAddress,
      achievement,
      authority,
      newTitle,
      newDescription,
      newNftMeta
    );
    transaction.add(update);

    return { transaction };
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
    const txesWithSigners = zip(transactions, signers, []);
    const txSigs: string[] = [];

    for (const [tx, signers] of txesWithSigners) {
      const txSig = await this.sendAndConfirmTransaction(tx, signers, opts);
      txSigs.push(txSig);
    }

    return txSigs;
  }

  public async newGame(
    title: string,
    description: string,
    genre: string,
    gameType: string,
    nftMeta: PublicKey,
    auths: PublicKey[]
  ): Promise<Game> {
    const game = await Game.register(
      this,
      title,
      description,
      genre,
      gameType,
      nftMeta,
      auths
    );
    return game;
  }

  public async fetchAllGameAccountsInfo(): Promise<GameAccountInfo[]> {
    const games = await this.program.account.game.all();

    return games.map((game) =>
      gameInfoFromIdlAccount(game.account, game.publicKey)
    );
  }

  public async fetchAllPlayerAccountsInfo(): Promise<PlayerAccountInfo[]> {
    const players = await this.program.account.playerInfo.all();

    return players.map((player) =>
      playerInfoFromIdlAccount(player.account, player.publicKey)
    );
  }

  public async getAllUserPlayerAccountsKeys(
    user: PublicKey
  ): Promise<PublicKey[]> {
    const playerInfo = derivePlayerInfoAddress(user, this.program.programId)[0];
    const playerAccount = await this.program.account.playerInfo.fetch(
      playerInfo
    );
    const mergeAccount = playerAccount.merged;

    if (mergeAccount === PublicKey.default) {
      return [playerInfo];
    }

    const mergeAccountInfo = await this.program.account.merged.fetch(
      mergeAccount
    );
    return mergeAccountInfo.keys;
  }

  public async fetchGameAccountsInfoByGenre(
    genre: string
  ): Promise<GameAccountInfo[]> {
    const games = await this.program.account.game.all([
      {
        memcmp: {
          offset: 8 + 200 + 30,
          bytes: bs58.encode(Buffer.from(genre)),
        },
      },
    ]);
    return games.map((game) =>
      gameInfoFromIdlAccount(game.account, game.publicKey)
    );
  }

  public async fetchUserAchievementInfo(
    user: PublicKey
  ): Promise<PlayerAchievementAccountInfo[]> {
    const player = derivePlayerInfoAddress(user, this.program.programId)[0];
    const achievements = await this.program.account.playerAchievement.all([
      {
        memcmp: {
          offset: 8,
          bytes: player.toBase58(),
        },
      },
    ]);

    return achievements.map((achievement) =>
      playerAchievementFromIdlAccount(
        achievement.account,
        achievement.publicKey
      )
    );
  }
}
