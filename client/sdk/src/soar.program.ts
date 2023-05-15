import { type AnchorProvider, type IdlTypes, Program } from "@coral-xyz/anchor";
import {
  type AccountMeta,
  type ConfirmOptions,
  Keypair,
  type PublicKey,
  type Signer,
  Transaction,
} from "@solana/web3.js";
import { IDL, type Soar } from "./idl/soar";
import { PROGRAM_ID } from "./constants";
import type BN from "bn.js";
import {
  addLeaderBoardInstruction,
  addAchievementInstruction,
  createPlayerInstruction,
  initializeGameInstruction,
  registerPlayerEntryInstruction,
  updateAchievementInstruction,
  updateGameInstruction,
  updatePlayerInstruction,
  submitScoreInstruction,
  unlockPlayerAchievementInstruction,
  addRewardInstruction,
  mintRewardInstruction,
  verifyRewardInstruction,
  initiateMergeInstruction,
  registerMergeApprovalInstruction,
} from "./instructions";
import {
  deriveAchievementAddress,
  deriveLeaderBoardAddress,
  derivePlayerAchievementAddress,
  derivePlayerEntryListAddress,
  derivePlayerAddress,
  deriveRewardAddress,
  deriveEditionAddress,
  deriveMetadataAddress,
  deriveAssociatedTokenAddress,
  zip,
} from "./utils";
import { type InstructionResult } from "./types";
import { Game } from "./soar.game";
import {
  type GameType,
  type Genre,
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
    genre: Genre,
    gameType: GameType,
    nftMeta: PublicKey,
    authorities: PublicKey[]
  ): Promise<InstructionResult.InitializeGame> {
    const transaction = new Transaction();

    const newGameAddress = Keypair.generate().publicKey;

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
    const newPlayer = derivePlayerAddress(
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
    const playerInfo = derivePlayerAddress(
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

  public async initiateMerge(
    playerAccountKeys: PublicKey[]
  ): Promise<InstructionResult.InitiateMerge> {
    const transaction = new Transaction();

    const playerInfo = derivePlayerAddress(
      this.provider.publicKey,
      this.program.programId
    )[0];

    const accounts = playerAccountKeys.map((key) => {
      const meta: AccountMeta = {
        pubkey: key,
        isSigner: true,
        isWritable: false,
      };
      return meta;
    });

    const mergeAccount = Keypair.generate();

    const initMerge = await initiateMergeInstruction(
      this.program,
      this.provider.publicKey,
      playerInfo,
      mergeAccount,
      accounts
    );

    return {
      newMergeAccount: mergeAccount.publicKey,
      transaction: transaction.add(initMerge),
    };
  }

  public async registerMergeApproval(
    mergeAccount: PublicKey
  ): Promise<InstructionResult.RegisterMergeApproval> {
    const transaction = new Transaction();

    const playerInfo = derivePlayerAddress(
      this.provider.publicKey,
      this.program.programId
    )[0];

    const registerApproval = await registerMergeApprovalInstruction(
      this.program,
      this.provider.publicKey,
      playerInfo,
      mergeAccount
    );

    return {
      transaction: transaction.add(registerApproval),
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

    const playerInfo = derivePlayerAddress(
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
    const playerInfo = derivePlayerAddress(
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

  public async unlockPlayerAchievement(
    authority: PublicKey,
    achievement: PublicKey,
    game: PublicKey | null,
    leaderboard: PublicKey | null
  ): Promise<InstructionResult.UnlockPlayerAchievement> {
    const playerAccount = derivePlayerAddress(
      this.provider.publicKey,
      this.program.programId
    )[0];

    const gameAddress =
      game ?? (await this.program.account.achievement.fetch(achievement)).game;

    let leaderBoardAddress: PublicKey;
    if (leaderboard === null) {
      const gameAccount = await this.program.account.game.fetch(gameAddress);
      leaderBoardAddress = deriveLeaderBoardAddress(
        gameAccount.leaderboard as any as BN,
        gameAddress,
        this.program.programId
      )[0];
    } else {
      leaderBoardAddress = leaderboard;
    }

    const playerEntryList = derivePlayerEntryListAddress(
      playerAccount,
      leaderBoardAddress,
      this.program.programId
    )[0];
    const newPlayerAchievement = derivePlayerAchievementAddress(
      this.provider.publicKey,
      achievement,
      this.program.programId
    )[0];

    const unlock = await unlockPlayerAchievementInstruction(
      this.program,
      this.provider.publicKey,
      playerAccount,
      playerEntryList,
      gameAddress,
      leaderBoardAddress,
      achievement,
      authority,
      newPlayerAchievement
    );

    return {
      newPlayerAchievement,
      transaction: new Transaction().add(unlock),
    };
  }

  public async addRewardForAchievement(
    authority: PublicKey,
    achievement: PublicKey,
    payer: PublicKey,
    game: PublicKey | null,
    uri: string,
    name: string,
    symbol: string,
    includeCollection: {
      authority: PublicKey;
      mint: PublicKey;
      metadata: PublicKey;
    } | null
  ): Promise<InstructionResult.AddReward> {
    const gameAddress =
      game ?? (await this.program.account.achievement.fetch(achievement)).game;

    const newRewardAddress = deriveRewardAddress(
      achievement,
      this.program.programId
    )[0];

    const instruction = await addRewardInstruction(
      this.program,
      authority,
      payer,
      achievement,
      gameAddress,
      newRewardAddress,
      uri,
      name,
      symbol,
      includeCollection !== null ? includeCollection.authority : null,
      includeCollection !== null ? includeCollection.mint : null,
      includeCollection !== null ? includeCollection.metadata : null
    );

    return {
      newReward: newRewardAddress,
      transaction: new Transaction().add(instruction),
    };
  }

  public async mintPlayerRewardForAchievement(
    authority: PublicKey,
    achievement: PublicKey,
    payer: PublicKey,
    user: PublicKey,
    game: PublicKey | null
  ): Promise<InstructionResult.MintReward> {
    const gameAddress =
      game ?? (await this.program.account.achievement.fetch(achievement)).game;

    const userPlayerAccount = derivePlayerAddress(
      user,
      this.program.programId
    )[0];
    const rewardAddress = deriveRewardAddress(
      achievement,
      this.program.programId
    )[0];
    const playerAchievement = derivePlayerAchievementAddress(
      userPlayerAccount,
      achievement,
      this.program.programId
    )[0];

    const mint = Keypair.generate();
    const metadata = deriveMetadataAddress(mint.publicKey)[0];
    const masterEdition = deriveEditionAddress(mint.publicKey)[0];
    const ata = deriveAssociatedTokenAddress(mint.publicKey, user);

    const instruction = await mintRewardInstruction(
      this.program,
      authority,
      payer,
      user,
      userPlayerAccount,
      gameAddress,
      achievement,
      rewardAddress,
      playerAchievement,
      mint,
      metadata,
      masterEdition,
      ata
    );

    return {
      newMint: mint.publicKey,
      transaction: new Transaction().add(instruction),
    };
  }

  public async verifyPlayerMintedRewardForAchievement(
    authority: PublicKey,
    payer: PublicKey,
    achievement: PublicKey,
    game: PublicKey | null,
    user: PublicKey
  ): Promise<InstructionResult.VerifyReward> {
    const gameAddress =
      game ?? (await this.program.account.achievement.fetch(achievement)).game;

    const userPlayerAccount = derivePlayerAddress(
      user,
      this.program.programId
    )[0];
    const rewardAddress = deriveRewardAddress(
      achievement,
      this.program.programId
    )[0];
    const playerAchievement = derivePlayerAchievementAddress(
      userPlayerAccount,
      achievement,
      this.program.programId
    )[0];

    const account = await this.program.account.playerAchievement.fetch(
      playerAchievement
    );
    if (account === null || account.metadata === null) {
      throw new Error("No reward minted for this user.");
    }

    const rewardAccount = await this.program.account.reward.fetch(
      rewardAddress
    );
    if (rewardAccount.collectionMint === null) {
      throw new Error("No collection to verify rewards for.");
    }

    const mint = rewardAccount.collectionMint;
    const metadata = deriveMetadataAddress(mint)[0];
    const edition = deriveEditionAddress(mint)[0];

    const instruction = await verifyRewardInstruction(
      this.program,
      authority,
      payer,
      user,
      userPlayerAccount,
      gameAddress,
      achievement,
      rewardAddress,
      playerAchievement,
      account.metadata,
      rewardAccount.collectionMint,
      metadata,
      edition
    );

    return {
      transaction: new Transaction().add(instruction),
    };
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
    genre: Genre,
    gameType: GameType,
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
    const players = await this.program.account.player.all();

    return players.map((player) =>
      playerInfoFromIdlAccount(player.account, player.publicKey)
    );
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
    const player = derivePlayerAddress(user, this.program.programId)[0];
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
