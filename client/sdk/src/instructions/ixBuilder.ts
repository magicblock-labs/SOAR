import { IDL, type Soar } from "../idl/soar";
import { type AnchorProvider, Program } from "@coral-xyz/anchor";
import {
  Transaction,
  type PublicKey,
  type TransactionInstruction,
  type Signer,
  type ConfirmOptions,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  type InitializeGameArgs,
  type AddAchievementArgs,
  type AddNftRewardArgs,
  type AddFtRewardArgs,
  type InitializePlayerArgs,
  type InitMergeArgs,
  type SubmitScoreArgs,
  type UpdateAchievementArgs,
  type UpdateGameArgs,
  type UpdateLeaderboardArgs,
  type UpdatePlayerArgs,
  type AddLeaderBoardArgs,
} from "../types";
import {
  addLeaderBoardInstruction,
  addAchievementInstruction,
  initPlayerInstruction,
  initializeGameInstruction,
  registerPlayerEntryInstruction,
  updateAchievementInstruction,
  updateGameInstruction,
  updatePlayerInstruction,
  updateLeaderBoardInstruction,
  submitScoreInstruction,
  unlockPlayerAchievementInstruction,
  initiateMergeInstruction,
  registerMergeApprovalInstruction,
  addFtRewardInstruction,
  addNftRewardInstruction,
  claimFtRewardInstruction,
  claimNftRewardInstruction,
  verifyNftRewardInstruction,
} from "./rawInstructions";
import { TOKEN_METADATA_PROGRAM_ID, PROGRAM_ID } from "../constants";
import { Utils } from "../utils";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { AchievementAccount, RewardAccount } from "../state";

export class InstructionBuilder {
  instructions: TransactionInstruction[];
  signers: Signer[];
  readonly program: Program<Soar>;
  readonly utils: Utils;

  constructor(private readonly provider: AnchorProvider) {
    this.instructions = [];
    this.signers = [];
    this.program = new Program<Soar>(IDL, PROGRAM_ID, provider);
    this.utils = new Utils(this.program.programId);
  }

  append = (instructions: TransactionInstruction[]): InstructionBuilder => {
    this.instructions = this.instructions.concat(instructions);
    return this;
  };

  public async andInitializeGame(
    args: InitializeGameArgs,
    newGame: PublicKey
  ): Promise<InstructionBuilder> {
    const instruction = await initializeGameInstruction(this.program, args, {
      creator: this.provider.publicKey,
      game: newGame,
      systemProgram: SystemProgram.programId,
    });

    return this.append([instruction]);
  }

  public async andInitializePlayer(
    args: InitializePlayerArgs,
    user: PublicKey
  ): Promise<InstructionBuilder> {
    const newPlayer = this.utils.derivePlayerAddress(user)[0];

    const instruction = await initPlayerInstruction(this.program, args, {
      playerAccount: newPlayer,
      user,
      payer: this.provider.publicKey,
      systemProgram: SystemProgram.programId,
    });

    return this.append([instruction]);
  }

  public async andUpdateGame(
    args: UpdateGameArgs,
    game: PublicKey,
    authority: PublicKey
  ): Promise<InstructionBuilder> {
    const instruction = await updateGameInstruction(this.program, args, {
      payer: this.provider.publicKey,
      game,
      authority,
      systemProgram: SystemProgram.programId,
    });

    return this.append([instruction]);
  }

  public async andUpdatePlayer(
    args: UpdatePlayerArgs,
    user: PublicKey
  ): Promise<InstructionBuilder> {
    const playerAccount = this.utils.derivePlayerAddress(user)[0];

    const instruction = await updatePlayerInstruction(this.program, args, {
      user,
      playerAccount,
    });

    return this.append([instruction]);
  }

  public async andInitiateMerge(
    args: InitMergeArgs,
    user: PublicKey,
    newMergeAccount: PublicKey
  ): Promise<InstructionBuilder> {
    const playerAccount = this.utils.derivePlayerAddress(user)[0];

    const instruction = await initiateMergeInstruction(this.program, args, {
      user,
      payer: this.provider.publicKey,
      playerAccount,
      mergeAccount: newMergeAccount,
      systemProgram: SystemProgram.programId,
    });

    return this.append([instruction]);
  }

  public async andRegisterMergeApproval(
    user: PublicKey,
    mergeAccount: PublicKey
  ): Promise<InstructionBuilder> {
    const playerAccount = this.utils.derivePlayerAddress(user)[0];

    const instruction = await registerMergeApprovalInstruction(this.program, {
      user,
      playerAccount,
      mergeAccount,
    });

    return this.append([instruction]);
  }

  public async andAddAchievement(
    args: AddAchievementArgs,
    game: PublicKey,
    authority: PublicKey,
    nextAchievement?: PublicKey
  ): Promise<InstructionBuilder> {
    let newAchievement = nextAchievement;
    if (newAchievement === undefined) {
      const gameAccount = await this.program.account.game.fetch(game);
      const id = gameAccount.achievementCount.addn(1);
      newAchievement = this.utils.deriveAchievementAddress(id, game)[0];
    }

    const instruction = await addAchievementInstruction(this.program, args, {
      newAchievement,
      game,
      payer: this.provider.publicKey,
      authority,
      systemProgram: SystemProgram.programId,
    });
    return this.append([instruction]);
  }

  public async andAddLeaderBoard(
    args: AddLeaderBoardArgs,
    gameAddress: PublicKey,
    authority: PublicKey,
    nextLeaderboard?: PublicKey
  ): Promise<InstructionBuilder> {
    let newLeaderBoard = nextLeaderboard;
    if (nextLeaderboard !== undefined) {
      newLeaderBoard = nextLeaderboard;
    } else {
      const gameAccount = await this.program.account.game.fetch(gameAddress);
      const id = gameAccount.leaderboardCount.addn(1);
      newLeaderBoard = this.utils.deriveLeaderBoardAddress(id, gameAddress)[0];
    }

    let topEntriesAccount: PublicKey | null = null;
    if (args.scoresToRetain !== null && args.scoresToRetain > 0) {
      topEntriesAccount =
        this.utils.deriveLeaderTopEntriesAddress(newLeaderBoard)[0];
    }

    const instruction = await addLeaderBoardInstruction(this.program, args, {
      authority,
      game: gameAddress,
      payer: this.provider.publicKey,
      leaderboard: newLeaderBoard,
      topEntries: topEntriesAccount,
      systemProgram: SystemProgram.programId,
    });

    return this.append([instruction]);
  }

  public async andUpdateLeaderboard(
    args: UpdateLeaderboardArgs,
    authority: PublicKey,
    leaderboard: PublicKey,
    game?: PublicKey
  ): Promise<InstructionBuilder> {
    const gameAddress =
      game ?? (await this.program.account.leaderBoard.fetch(leaderboard)).game;

    const instruction = await updateLeaderBoardInstruction(this.program, args, {
      authority,
      game: gameAddress,
      leaderboard,
    });
    return this.append([instruction]);
  }

  public async andRegisterPlayerEntry(
    user: PublicKey,
    leaderboard: PublicKey,
    game?: PublicKey
  ): Promise<InstructionBuilder> {
    const gameAddress =
      game ?? (await this.program.account.leaderBoard.fetch(leaderboard)).game;
    const playerAccount = this.utils.derivePlayerAddress(user)[0];
    const newList = this.utils.derivePlayerScoresListAddress(
      user,
      leaderboard
    )[0];

    const instruction = await registerPlayerEntryInstruction(this.program, {
      user,
      payer: this.provider.publicKey,
      playerAccount,
      newList,
      game: gameAddress,
      leaderboard,
      systemProgram: SystemProgram.programId,
    });
    return this.append([instruction]);
  }

  public async andSubmitScore(
    args: SubmitScoreArgs,
    user: PublicKey,
    authority: PublicKey,
    leaderboard: PublicKey,
    game?: PublicKey
  ): Promise<InstructionBuilder> {
    const gameAddress =
      game ?? (await this.program.account.leaderBoard.fetch(leaderboard)).game;
    const playerAccount = this.utils.derivePlayerAddress(user)[0];
    const playerScores = this.utils.derivePlayerScoresListAddress(
      user,
      leaderboard
    )[0];
    const topEntries = this.utils.deriveLeaderTopEntriesAddress(leaderboard)[0];

    const instruction = await submitScoreInstruction(this.program, args, {
      user,
      payer: this.provider.publicKey,
      playerAccount,
      authority,
      game: gameAddress,
      leaderboard,
      playerScores,
      topEntries,
      systemProgram: SystemProgram.programId,
    });

    return this.append([instruction]);
  }

  public async andUpdateAchievement(
    args: UpdateAchievementArgs,
    authority: PublicKey,
    achievement: PublicKey,
    game?: PublicKey
  ): Promise<InstructionBuilder> {
    const gameAddress =
      game ?? (await this.program.account.achievement.fetch(achievement)).game;

    const instruction = await updateAchievementInstruction(this.program, args, {
      authority,
      game: gameAddress,
      achievement,
    });
    return this.append([instruction]);
  }

  public async andUnlockPlayerAchievement(
    user: PublicKey,
    authority: PublicKey,
    achievement: PublicKey,
    leaderboard: PublicKey,
    game?: PublicKey
  ): Promise<InstructionBuilder> {
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

    const instruction = await unlockPlayerAchievementInstruction(this.program, {
      user,
      payer: this.provider.publicKey,
      playerAccount,
      playerScores: playerEntryList,
      game: gameAddress,
      leaderboard,
      achievement,
      authority,
      playerAchievement: newPlayerAchievement,
    });

    return this.append([instruction]);
  }

  public async andAddFungibleReward(
    args: AddFtRewardArgs,
    authority: PublicKey,
    newReward: PublicKey,
    achievement: PublicKey,
    sourceTokenAccount: PublicKey,
    tokenAccountOwner: PublicKey,
    mint: PublicKey,
    game?: PublicKey
  ): Promise<InstructionBuilder> {
    const gameAddress =
      game ?? (await this.program.account.achievement.fetch(achievement)).game;

    const instruction = await addFtRewardInstruction(this.program, args, {
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
    });

    return this.append([instruction]);
  }

  public async andAddNonFungibleReward(
    args: AddNftRewardArgs,
    authority: PublicKey,
    newReward: PublicKey,
    achievement: PublicKey,
    collectionMint?: PublicKey,
    collectionUpdateAuthority?: PublicKey,
    game?: PublicKey
  ): Promise<InstructionBuilder> {
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

    const instruction = await addNftRewardInstruction(this.program, args, {
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
    });

    return this.append([instruction]);
  }

  public async andClaimNftReward(
    achievement: PublicKey,
    mint: PublicKey,
    user: PublicKey,
    reward?: PublicKey,
    game?: PublicKey
  ): Promise<InstructionBuilder> {
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
    const instruction = await claimNftRewardInstruction(this.program, {
      user,
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
    });

    return this.append([instruction]);
  }

  public async andClaimFtReward(
    achievement: PublicKey,
    user: PublicKey,
    reward?: PublicKey,
    game?: PublicKey
  ): Promise<InstructionBuilder> {
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

    const pre = new Array<TransactionInstruction>();
    const userAta = this.utils.deriveAssociatedTokenAddress(mint, user);
    const tokenAccount = await this.provider.connection.getAccountInfo(userAta);
    if (tokenAccount === null) {
      pre.push(
        createAssociatedTokenAccountIdempotentInstruction(
          this.provider.publicKey,
          userAta,
          mint,
          user
        )
      );
    }

    const instruction = await claimFtRewardInstruction(this.program, {
      user,
      playerAccount,
      game: gameAddress,
      achievement,
      reward: rewardAddress,
      playerAchievement,
      sourceTokenAccount: rewardAccount.FungibleToken.account,
      userTokenAccount: userAta,
      tokenProgram: TOKEN_PROGRAM_ID,
    });

    return this.append([instruction]);
  }

  public async andVerifyPlayerNftReward(
    user: PublicKey,
    achievement: PublicKey,
    mint: PublicKey,
    reward?: PublicKey,
    game?: PublicKey
  ): Promise<InstructionBuilder> {
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

    const instruction = await verifyNftRewardInstruction(this.program, {
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
    });

    return this.append([instruction]);
  }

  sign(signers: Signer[]): void {
    this.signers = signers;
  }

  build(): Transaction {
    const transaction = new Transaction();
    this.instructions.forEach((ix) => transaction.add(ix));
    return transaction;
  }

  clean(): void {
    this.instructions = [];
  }

  public async complete(opts?: ConfirmOptions): Promise<string> {
    return this.provider
      .sendAndConfirm(this.build(), this.signers, opts)
      .catch((e) => {
        throw e;
      });
  }
}
