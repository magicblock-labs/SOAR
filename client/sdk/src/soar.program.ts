import { type AnchorProvider, Program } from "@coral-xyz/anchor";
import {
  type ConfirmOptions,
  PublicKey,
  type GetProgramAccountsFilter,
  type Signer,
  type TransactionInstruction,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { IDL, type Soar } from "./idl/soar";
import { PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID } from "./constants";
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
  updateLeaderBoardInstruction,
  submitScoreInstruction,
  unlockPlayerAchievementInstruction,
  addRewardInstruction,
  claimRewardInstruction,
  verifyRewardInstruction,
  initiateMergeInstruction,
  registerMergeApprovalInstruction,
} from "./instructions";
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
import {
  createAssociatedTokenAccountIdempotentInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { GameClient } from "./soar.game";

export class SoarProgram {
  readonly program: Program<Soar>;
  readonly utils: Utils;

  private constructor(readonly provider: AnchorProvider) {
    this.utils = new Utils();
    this.program = new Program<Soar>(IDL, PROGRAM_ID, provider);
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
    const transaction = new Transaction();

    const initGame = await initializeGameInstruction(
      this.program,
      newGame,
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
      newGame,
      transaction,
    };
  }

  public async initializePlayerAccount(
    user: PublicKey,
    username: string,
    nftMeta: PublicKey
  ): Promise<InstructionResult.CreatePlayer> {
    const transaction = new Transaction();
    const newPlayer = this.derivePlayerAddress(user)[0];

    const initPlayer = await createPlayerInstruction(
      this.program,
      newPlayer,
      user,
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
    newMeta: GameAttributes | null,
    newAuths: PublicKey[] | null
  ): Promise<InstructionResult.UpdateGame> {
    const transaction = new Transaction();

    const update = await updateGameInstruction(
      this.program,
      this.provider.publicKey,
      game,
      authority,
      newMeta,
      newAuths
    );
    transaction.add(update);

    return { transaction };
  }

  public async updatePlayerAccount(
    user: PublicKey,
    updatedUsername: string,
    updatedNftMeta: PublicKey | null
  ): Promise<InstructionResult.UpdatePlayer> {
    const transaction = new Transaction();
    const playerInfo = this.derivePlayerAddress(user)[0];

    const update = await updatePlayerInstruction(
      this.program,
      user,
      playerInfo,
      updatedUsername,
      updatedNftMeta
    );
    transaction.add(update);

    return { transaction };
  }

  public async initiateMerge(
    user: PublicKey,
    newMergeAccount: PublicKey,
    playerAccountKeys: PublicKey[]
  ): Promise<InstructionResult.InitiateMerge> {
    const transaction = new Transaction();
    const playerInfo = this.derivePlayerAddress(user)[0];

    const initMerge = await initiateMergeInstruction(
      this.program,
      user,
      this.provider.publicKey,
      playerInfo,
      newMergeAccount,
      playerAccountKeys
    );

    return {
      newMerge: newMergeAccount,
      transaction: transaction.add(initMerge),
    };
  }

  public async registerMergeApproval(
    user: PublicKey,
    mergeAccount: PublicKey
  ): Promise<InstructionResult.RegisterMergeApproval> {
    const transaction = new Transaction();
    const playerInfo = this.derivePlayerAddress(user)[0];

    const registerApproval = await registerMergeApprovalInstruction(
      this.program,
      user,
      playerInfo,
      mergeAccount
    );

    return {
      transaction: transaction.add(registerApproval),
    };
  }

  public async addNewGameAchievement(
    gameAddress: PublicKey,
    authority: PublicKey,
    title: string,
    description: string,
    nftMeta: PublicKey,
    nextAchievement?: PublicKey
  ): Promise<InstructionResult.AddGameAchievement> {
    const transaction = new Transaction();

    const gameAccount = await this.fetchGameAccount(gameAddress);
    const id = gameAccount.achievementCount.addn(1);
    const newAchievement =
      nextAchievement ?? this.deriveAchievementAddress(id, gameAddress)[0];

    const addAchievement = await addAchievementInstruction(
      this.program,
      newAchievement,
      gameAddress,
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
    authority: PublicKey,
    description: string,
    nftMeta: PublicKey,
    scoresToRetain: number | null,
    scoresOrder: boolean | null,
    decimals: number | null,
    minScore: BN | null,
    maxScore: BN | null,
    nextLeaderboard?: PublicKey
  ): Promise<InstructionResult.AddLeaderBoard> {
    const transaction = new Transaction();

    let newLeaderBoard: PublicKey;
    if (nextLeaderboard !== undefined) {
      newLeaderBoard = nextLeaderboard;
    } else {
      const gameAccount = await this.program.account.game.fetch(gameAddress);
      const id = (gameAccount.leaderboard as any as BN).addn(1);
      newLeaderBoard = this.deriveLeaderBoardAddress(id, gameAddress)[0];
    }
    const topEntries = this.deriveLeaderTopEntriesAddress(newLeaderBoard)[0];

    let topEntriesAccount: PublicKey | null = null;
    if (scoresToRetain !== null && scoresToRetain > 0) {
      topEntriesAccount = this.deriveLeaderTopEntriesAddress(newLeaderBoard)[0];
    }

    const addBoard = await addLeaderBoardInstruction(
      this.program,
      newLeaderBoard,
      this.provider.publicKey,
      gameAddress,
      topEntriesAccount,
      authority,
      description,
      nftMeta,
      scoresToRetain ?? 0,
      scoresOrder ?? true,
      decimals,
      minScore,
      maxScore
    );
    transaction.add(addBoard);

    return { newLeaderBoard, topEntries, transaction };
  }

  public async updateGameLeaderboard(
    authority: PublicKey,
    leaderboard: PublicKey,
    newDescription: string | null,
    newNftMeta: PublicKey | null,
    game?: PublicKey
  ): Promise<InstructionResult.UpdateLeaderboard> {
    const transaction = new Transaction();

    const gameAddress =
      game ?? (await this.fetchLeaderBoardAccount(leaderboard)).game;

    const updateIx = await updateLeaderBoardInstruction(
      this.program,
      authority,
      gameAddress,
      leaderboard,
      newDescription,
      newNftMeta
    );
    transaction.add(updateIx);

    return { transaction };
  }

  public async registerPlayerEntryForLeaderBoard(
    user: PublicKey,
    leaderboard: PublicKey,
    game?: PublicKey
  ): Promise<InstructionResult.RegisterPlayerEntry> {
    const transaction = new Transaction();

    const gameAddress =
      game ?? (await this.fetchLeaderBoardAccount(leaderboard)).game;
    const playerInfo = this.derivePlayerAddress(user)[0];
    const newList = this.derivePlayerEntryListAddress(user, leaderboard)[0];

    const register = await registerPlayerEntryInstruction(
      this.program,
      user,
      this.provider.publicKey,
      playerInfo,
      newList,
      gameAddress,
      leaderboard
    );
    transaction.add(register);

    return { newList, transaction };
  }

  public async submitScoreToLeaderBoard(
    user: PublicKey,
    authority: PublicKey,
    leaderboard: PublicKey,
    score: BN,
    game?: PublicKey
  ): Promise<InstructionResult.SubmitScore> {
    const transaction = new Transaction();

    const gameAddress =
      game ?? (await this.fetchLeaderBoardAccount(leaderboard)).game;
    const playerInfo = this.derivePlayerAddress(user)[0];
    const playerEntryList = this.derivePlayerEntryListAddress(
      user,
      leaderboard
    )[0];
    const topEntries = this.deriveLeaderTopEntriesAddress(leaderboard)[0];

    const preInstructions = new Array<TransactionInstruction>();
    const playerEntryInfo = await this.fetchPlayerScoresListAccount(
      playerEntryList
    );

    if (playerEntryInfo === null) {
      const register = await registerPlayerEntryInstruction(
        this.program,
        user,
        this.provider.publicKey,
        playerInfo,
        playerEntryList,
        gameAddress,
        leaderboard
      );
      preInstructions.push(register);
    }

    const submit = await submitScoreInstruction(
      this.program,
      user,
      this.provider.publicKey,
      playerInfo,
      authority,
      gameAddress,
      leaderboard,
      playerEntryList,
      topEntries,
      score,
      preInstructions
    );
    transaction.add(submit);

    return { transaction };
  }

  public async updateGameAchievement(
    authority: PublicKey,
    achievement: PublicKey,
    newTitle: string | null,
    newDescription: string | null,
    newNftMeta: PublicKey | null,
    game?: PublicKey
  ): Promise<InstructionResult.UpdateAchievement> {
    const transaction = new Transaction();

    const gameAddress =
      game ?? (await this.fetchAchievementAccount(achievement)).game;

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
    user: PublicKey,
    authority: PublicKey,
    achievement: PublicKey,
    leaderboard: PublicKey,
    game?: PublicKey
  ): Promise<InstructionResult.UnlockPlayerAchievement> {
    const playerAccount = this.derivePlayerAddress(user)[0];

    const gameAddress =
      game ?? (await this.fetchAchievementAccount(achievement)).game;
    const playerEntryList = this.derivePlayerEntryListAddress(
      user,
      leaderboard
    )[0];
    const newPlayerAchievement = this.derivePlayerAchievementAddress(
      user,
      achievement
    )[0];

    const unlock = await unlockPlayerAchievementInstruction(
      this.program,
      user,
      this.provider.publicKey,
      playerAccount,
      playerEntryList,
      gameAddress,
      leaderboard,
      achievement,
      authority,
      newPlayerAchievement
    );

    return {
      newPlayerAchievement,
      transaction: new Transaction().add(unlock),
    };
  }

  public async addFungibleReward(
    authority: PublicKey,
    newReward: PublicKey,
    achievement: PublicKey,
    amountPerUser: BN,
    availableRewards: BN,
    initialDelegation: BN,
    sourceTokenAccount: PublicKey,
    tokenAccountOwner: PublicKey,
    mint: PublicKey,
    game?: PublicKey
  ): Promise<InstructionResult.AddReward> {
    const gameAddress =
      game ?? (await this.fetchAchievementAccount(achievement)).game;

    const instruction = await addRewardInstruction(
      this.program,
      amountPerUser,
      availableRewards,
      {
        deposit: initialDelegation,
        mint,
      },
      undefined,
      authority,
      this.provider.publicKey,
      gameAddress,
      achievement,
      newReward,
      SystemProgram.programId,
      mint,
      sourceTokenAccount,
      tokenAccountOwner,
      TOKEN_PROGRAM_ID
    );

    const oldReward = await this.fetchAchievementAccount(achievement).then(
      (res) => res.reward
    );
    return {
      oldReward,
      newReward,
      transaction: new Transaction().add(instruction),
    };
  }

  private createAssociatedTokenAccount(
    mint: PublicKey,
    ata: PublicKey,
    owner: PublicKey
  ): TransactionInstruction {
    return createAssociatedTokenAccountIdempotentInstruction(
      this.provider.publicKey,
      ata,
      owner,
      mint
    );
  }

  public async addNonFungibleReward(
    authority: PublicKey,
    newReward: PublicKey,
    achievement: PublicKey,
    amountPerUser: BN,
    availableRewards: BN,
    defineUri: string,
    defineName: string,
    defineSymbol: string,
    game?: PublicKey,
    collectionMint?: PublicKey,
    collectionUpdateAuthority?: PublicKey
  ): Promise<InstructionResult.AddReward> {
    const gameAddress =
      game ?? (await this.fetchAchievementAccount(achievement)).game;

    let collectionMetadata: PublicKey | undefined;
    let metadataProgram: PublicKey | undefined;
    if (collectionMint !== undefined) {
      collectionMetadata = this.utils.deriveMetadataAddress(collectionMint)[0];
      metadataProgram = TOKEN_METADATA_PROGRAM_ID;
    }

    const instruction = await addRewardInstruction(
      this.program,
      amountPerUser,
      availableRewards,
      undefined,
      {
        uri: defineUri,
        name: defineName,
        symbol: defineSymbol,
      },
      authority,
      this.provider.publicKey,
      gameAddress,
      achievement,
      newReward,
      SystemProgram.programId,
      undefined,
      undefined,
      undefined,
      undefined,
      collectionUpdateAuthority,
      collectionMint,
      collectionMetadata,
      metadataProgram
    );

    const oldReward = await this.fetchAchievementAccount(achievement).then(
      (res) => res.reward
    );
    return {
      oldReward,
      newReward,
      transaction: new Transaction().add(instruction),
    };
  }

  public async claimNftReward(
    achievement: PublicKey,
    mint: PublicKey,
    user: PublicKey,
    reward?: PublicKey,
    game?: PublicKey
  ): Promise<InstructionResult.MintReward> {
    const transaction = new Transaction();

    const gameAddress =
      game ?? (await this.fetchAchievementAccount(achievement)).game;

    const rewardAddress =
      reward ?? (await this.fetchAchievementAccount(achievement)).reward;
    if (rewardAddress === null) {
      throw new Error("No reward for achievement");
    }

    const userPlayerAccount = this.derivePlayerAddress(user)[0];
    const playerAchievement = this.derivePlayerAchievementAddress(
      user,
      achievement
    )[0];

    const metadata = this.utils.deriveMetadataAddress(mint)[0];
    const masterEdition = this.utils.deriveEditionAddress(mint)[0];
    const userAta = this.utils.deriveAssociatedTokenAddress(mint, user);

    const claim = this.deriveNftClaimAddress(rewardAddress, mint)[0];
    const instruction = await claimRewardInstruction(
      this.program,
      user,
      userPlayerAccount,
      gameAddress,
      achievement,
      rewardAddress,
      playerAchievement,
      {
        feePayer: this.provider.publicKey,
        claim,
        newMint: mint,
        newMetadata: metadata,
        newMasterEdition: masterEdition,
        mintNftTo: userAta,
      }
    );

    return {
      newMint: mint,
      transaction: transaction.add(instruction),
    };
  }

  public async claimFtReward(
    achievement: PublicKey,
    user: PublicKey,
    reward?: PublicKey,
    game?: PublicKey
  ): Promise<InstructionResult.MintReward> {
    const transaction = new Transaction();

    const gameAddress =
      game ?? (await this.fetchAchievementAccount(achievement)).game;

    const rewardAddress =
      reward ?? (await this.fetchAchievementAccount(achievement)).reward;
    if (rewardAddress === null) {
      throw new Error("No reward for achievement");
    }

    const userPlayerAccount = this.derivePlayerAddress(user)[0];
    const playerAchievement = this.derivePlayerAchievementAddress(
      user,
      achievement
    )[0];

    const rewardAccount = await this.fetchRewardAccount(rewardAddress);
    if (rewardAccount.FungibleToken === undefined) {
      throw new Error("Not a fungible-token reward");
    }
    const mint = rewardAccount.FungibleToken.mint;

    const userAta = this.utils.deriveAssociatedTokenAddress(mint, user);
    const account = await this.provider.connection.getAccountInfo(userAta);
    if (account === null) {
      transaction.add(this.createAssociatedTokenAccount(mint, userAta, user));
    }

    const instruction = await claimRewardInstruction(
      this.program,
      user,
      userPlayerAccount,
      gameAddress,
      achievement,
      rewardAddress,
      playerAchievement,
      undefined,
      {
        sourceTokenAccount: rewardAccount.FungibleToken.account,
        userTokenAccount: userAta,
      }
    );

    return {
      newMint: mint,
      transaction: transaction.add(instruction),
    };
  }

  public async verifyPlayerNftReward(
    user: PublicKey,
    achievement: PublicKey,
    mint: PublicKey,
    reward?: PublicKey,
    game?: PublicKey
  ): Promise<InstructionResult.VerifyReward> {
    const gameAddress =
      game ?? (await this.program.account.achievement.fetch(achievement)).game;

    const rewardAddress =
      reward ?? (await this.fetchAchievementAccount(achievement)).reward;
    if (rewardAddress === null) {
      throw new Error("No reward for achievement");
    }

    const userPlayerAccount = this.derivePlayerAddress(user)[0];
    const playerAchievement = this.derivePlayerAchievementAddress(
      user,
      achievement
    )[0];

    const claim = this.deriveNftClaimAddress(rewardAddress, mint)[0];
    const metadata = this.utils.deriveMetadataAddress(mint)[0];

    const rewardAccount = await this.fetchRewardAccount(rewardAddress);
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

    const instruction = await verifyRewardInstruction(
      this.program,
      this.provider.publicKey,
      user,
      userPlayerAccount,
      gameAddress,
      achievement,
      rewardAddress,
      playerAchievement,
      mint,
      claim,
      metadata,
      rewardAccount.NonFungibleToken.collection,
      collectionMetadata,
      collectionEdition
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
      [Buffer.from(Seeds.ENTRY), player.toBuffer(), leaderboard.toBuffer()],
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
