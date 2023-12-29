import { IDL, type Soar } from "../idl/soar";
import { type AnchorProvider, Program } from "@coral-xyz/anchor";
import {
  Transaction,
  type PublicKey,
  type TransactionInstruction,
  type Signer,
  type ConfirmOptions,
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
import { Utils } from "../utils";
import { AccountsBuilder } from "./accountsBuilder";

/** A class for constructing more-tailored and specific instructions. */
export class InstructionBuilder {
  instructions: TransactionInstruction[];
  signers: Signer[];

  readonly program: Program<Soar>;
  readonly utils: Utils;
  readonly accounts: AccountsBuilder;

  constructor(private readonly provider: AnchorProvider, programId: PublicKey) {
    this.instructions = [];
    this.signers = [];
    this.program = new Program<Soar>(IDL, programId, provider);
    this.utils = new Utils(this.program.programId);
    this.accounts = new AccountsBuilder(provider, programId);
  }

  append = (instructions: TransactionInstruction[]): InstructionBuilder => {
    this.instructions = this.instructions.concat(instructions);
    return this;
  };

  public async initGameStep(
    args: InitializeGameArgs,
    newGame: PublicKey
  ): Promise<
    [
      InstructionBuilder,
      Awaited<
        ReturnType<typeof AccountsBuilder.prototype.initializeGameAccounts>
      >
    ]
  > {
    const accounts = await this.accounts.initializeGameAccounts(newGame);
    const instruction = await initializeGameInstruction(
      this.program,
      args,
      accounts
    );

    return [this.append([instruction]), accounts];
  }

  public async initPlayerStep(
    args: InitializePlayerArgs,
    user: PublicKey
  ): Promise<
    [
      InstructionBuilder,
      Awaited<
        ReturnType<typeof AccountsBuilder.prototype.initializePlayerAccounts>
      >
    ]
  > {
    const accounts = await this.accounts.initializePlayerAccounts(user);
    const instruction = await initPlayerInstruction(
      this.program,
      args,
      accounts
    );

    return [this.append([instruction]), accounts];
  }

  public async updateGameStep(
    args: UpdateGameArgs,
    game: PublicKey,
    authority: PublicKey
  ): Promise<
    [
      InstructionBuilder,
      Awaited<ReturnType<typeof AccountsBuilder.prototype.updateGameAccounts>>
    ]
  > {
    const accounts = await this.accounts.updateGameAccounts(game, authority);
    const instruction = await updateGameInstruction(
      this.program,
      args,
      accounts
    );

    return [this.append([instruction]), accounts];
  }

  public async updatePlayerStep(
    args: UpdatePlayerArgs,
    user: PublicKey
  ): Promise<
    [
      InstructionBuilder,
      Awaited<ReturnType<typeof AccountsBuilder.prototype.updatePlayerAccounts>>
    ]
  > {
    const accounts = await this.accounts.updatePlayerAccounts(user);
    const instruction = await updatePlayerInstruction(
      this.program,
      args,
      accounts
    );

    return [this.append([instruction]), accounts];
  }

  public async initMergeStep(
    args: InitMergeArgs,
    user: PublicKey,
    newMergeAccount: PublicKey
  ): Promise<
    [
      InstructionBuilder,
      Awaited<
        ReturnType<typeof AccountsBuilder.prototype.initiateMergeAccounts>
      >
    ]
  > {
    const accounts = await this.accounts.initiateMergeAccounts(
      user,
      newMergeAccount
    );
    const instruction = await initiateMergeInstruction(
      this.program,
      args,
      accounts
    );

    return [this.append([instruction]), accounts];
  }

  public async registerMergeApprovalStep(
    user: PublicKey,
    mergeAccount: PublicKey
  ): Promise<
    [
      InstructionBuilder,
      Awaited<
        ReturnType<
          typeof AccountsBuilder.prototype.registerMergeApprovalAccounts
        >
      >
    ]
  > {
    const accounts = await this.accounts.registerMergeApprovalAccounts(
      user,
      mergeAccount
    );
    const instruction = await registerMergeApprovalInstruction(
      this.program,
      accounts
    );

    return [this.append([instruction]), accounts];
  }

  public async addAchievementStep(
    args: AddAchievementArgs,
    game: PublicKey,
    authority: PublicKey,
    nextAchievement?: PublicKey
  ): Promise<
    [
      InstructionBuilder,
      Awaited<
        ReturnType<typeof AccountsBuilder.prototype.addAchievementAccounts>
      >
    ]
  > {
    const accounts = await this.accounts.addAchievementAccounts(
      game,
      authority,
      nextAchievement
    );
    const instruction = await addAchievementInstruction(
      this.program,
      args,
      accounts
    );

    return [this.append([instruction]), accounts];
  }

  public async addLeaderBoardStep(
    args: AddLeaderBoardArgs,
    gameAddress: PublicKey,
    authority: PublicKey,
    nextLeaderboard?: PublicKey
  ): Promise<
    [
      InstructionBuilder,
      Awaited<
        ReturnType<typeof AccountsBuilder.prototype.addLeaderboardAccounts>
      >
    ]
  > {
    let nullTopEntries;
    if (args.scoresToRetain !== null && args.scoresToRetain > 0) {
      nullTopEntries = false;
    } else {
      nullTopEntries = true;
    }

    const accounts = await this.accounts.addLeaderboardAccounts(
      gameAddress,
      authority,
      nextLeaderboard,
      nullTopEntries
    );
    const instruction = await addLeaderBoardInstruction(
      this.program,
      args,
      accounts
    );

    return [this.append([instruction]), accounts];
  }

  public async updateLeaderboardStep(
    args: UpdateLeaderboardArgs,
    authority: PublicKey,
    leaderboard: PublicKey,
    game?: PublicKey,
    topEntries?: PublicKey
  ): Promise<
    [
      InstructionBuilder,
      Awaited<
        ReturnType<typeof AccountsBuilder.prototype.updateLeaderboardAccounts>
      >
    ]
  > {
    const accounts = await this.accounts.updateLeaderboardAccounts(
      authority,
      leaderboard,
      game,
      topEntries
    );
    const instruction = await updateLeaderBoardInstruction(
      this.program,
      args,
      accounts
    );

    return [this.append([instruction]), accounts];
  }

  public async registerPlayerEntryStep(
    user: PublicKey,
    leaderboard: PublicKey,
    game?: PublicKey
  ): Promise<
    [
      InstructionBuilder,
      Awaited<
        ReturnType<typeof AccountsBuilder.prototype.registerPlayerEntryAccounts>
      >
    ]
  > {
    const accounts = await this.accounts.registerPlayerEntryAccounts(
      user,
      leaderboard,
      game
    );
    const instruction = await registerPlayerEntryInstruction(
      this.program,
      accounts
    );

    return [this.append([instruction]), accounts];
  }

  public async submitScoreStep(
    args: SubmitScoreArgs,
    user: PublicKey,
    authority: PublicKey,
    leaderboard: PublicKey,
    game?: PublicKey
  ): Promise<
    [
      InstructionBuilder,
      Awaited<ReturnType<typeof AccountsBuilder.prototype.submitScoreAccounts>>
    ]
  > {
    const accounts = await this.accounts.submitScoreAccounts(
      user,
      authority,
      leaderboard,
      game
    );
    const instruction = await submitScoreInstruction(
      this.program,
      args,
      accounts
    );

    return [this.append([instruction]), accounts];
  }

  public async updateAchievementStep(
    args: UpdateAchievementArgs,
    authority: PublicKey,
    achievement: PublicKey,
    game?: PublicKey
  ): Promise<
    [
      InstructionBuilder,
      Awaited<
        ReturnType<typeof AccountsBuilder.prototype.updateAchievementAccounts>
      >
    ]
  > {
    const accounts = await this.accounts.updateAchievementAccounts(
      authority,
      achievement,
      game
    );
    const instruction = await updateAchievementInstruction(
      this.program,
      args,
      accounts
    );

    return [this.append([instruction]), accounts];
  }

  public async unlockPlayerAchievementStep(
    user: PublicKey,
    authority: PublicKey,
    achievement: PublicKey,
    leaderboard: PublicKey,
    game?: PublicKey
  ): Promise<
    [
      InstructionBuilder,
      Awaited<
        ReturnType<
          typeof AccountsBuilder.prototype.unlockPlayerAchievementAccounts
        >
      >
    ]
  > {
    const accounts = await this.accounts.unlockPlayerAchievementAccounts(
      user,
      authority,
      achievement,
      leaderboard,
      game
    );
    const instruction = await unlockPlayerAchievementInstruction(
      this.program,
      accounts
    );

    return [this.append([instruction]), accounts];
  }

  public async addFungibleRewardStep(
    args: AddFtRewardArgs,
    authority: PublicKey,
    newReward: PublicKey,
    achievement: PublicKey,
    sourceTokenAccount: PublicKey,
    tokenAccountOwner: PublicKey,
    mint: PublicKey,
    game?: PublicKey
  ): Promise<
    [
      InstructionBuilder,
      Awaited<ReturnType<typeof AccountsBuilder.prototype.addFtRewardAccounts>>
    ]
  > {
    const accounts = await this.accounts.addFtRewardAccounts(
      authority,
      newReward,
      achievement,
      sourceTokenAccount,
      tokenAccountOwner,
      mint,
      game
    );
    const instruction = await addFtRewardInstruction(
      this.program,
      args,
      accounts
    );

    return [this.append([instruction]), accounts];
  }

  public async addNonFungibleRewardStep(
    args: AddNftRewardArgs,
    authority: PublicKey,
    newReward: PublicKey,
    achievement: PublicKey,
    collectionMint?: PublicKey,
    collectionUpdateAuthority?: PublicKey,
    game?: PublicKey
  ): Promise<
    [
      InstructionBuilder,
      Awaited<ReturnType<typeof AccountsBuilder.prototype.addNftRewardAccounts>>
    ]
  > {
    const accounts = await this.accounts.addNftRewardAccounts(
      authority,
      newReward,
      achievement,
      collectionMint,
      collectionUpdateAuthority,
      game
    );
    const instruction = await addNftRewardInstruction(
      this.program,
      args,
      accounts
    );

    return [this.append([instruction]), accounts];
  }

  public async claimNftRewardStep(
    authority: PublicKey,
    achievement: PublicKey,
    mint: PublicKey,
    user: PublicKey,
    reward?: PublicKey,
    game?: PublicKey
  ): Promise<
    [
      InstructionBuilder,
      Awaited<
        ReturnType<typeof AccountsBuilder.prototype.claimNftRewardAccounts>
      >
    ]
  > {
    const accounts = await this.accounts.claimNftRewardAccounts(
      authority,
      achievement,
      mint,
      user,
      reward,
      game
    );
    const instruction = await claimNftRewardInstruction(this.program, accounts);

    return [this.append([instruction]), accounts];
  }

  public async claimFtRewardStep(
    authority: PublicKey,
    achievement: PublicKey,
    user: PublicKey,
    reward?: PublicKey,
    game?: PublicKey
  ): Promise<
    [
      InstructionBuilder,
      Awaited<
        ReturnType<typeof AccountsBuilder.prototype.claimFtRewardAccounts>
      >
    ]
  > {
    const accounts = await this.accounts.claimFtRewardAccounts(
      authority,
      achievement,
      user,
      reward,
      game
    );
    const omitted: Omit<
      Awaited<
        ReturnType<typeof AccountsBuilder.prototype.claimFtRewardAccounts>
      >,
      "mint"
    > = { ...accounts };
    const instruction = await claimFtRewardInstruction(this.program, omitted);

    return [this.append([instruction]), accounts];
  }

  public async verifyPlayerNftRewardStep(
    user: PublicKey,
    achievement: PublicKey,
    mint: PublicKey,
    reward?: PublicKey,
    game?: PublicKey
  ): Promise<
    [
      InstructionBuilder,
      Awaited<
        ReturnType<typeof AccountsBuilder.prototype.verifyNftRewardAccounts>
      >
    ]
  > {
    const accounts = await this.accounts.verifyNftRewardAccounts(
      user,
      achievement,
      mint,
      reward,
      game
    );
    const instruction = await verifyNftRewardInstruction(
      this.program,
      accounts
    );

    return [this.append([instruction]), accounts];
  }

  sign(signers: Signer[]): void {
    this.signers = this.signers.concat(signers);
  }

  /** Bundle instructions into a single transaction. */
  build(): Transaction {
    const transaction = new Transaction();
    this.instructions.forEach((ix) => transaction.add(ix));
    this.clean();
    return transaction;
  }

  /** Internally reset the instruction list in this instance. */
  clean(): void {
    this.instructions = [];
  }

  /** Send and confirm the bundled transaction. */
  public async complete(opts?: ConfirmOptions): Promise<string> {
    return this.provider
      .sendAndConfirm(this.build(), this.signers, opts)
      .catch((e) => {
        throw e;
      });
  }
}
