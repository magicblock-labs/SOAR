import { type PublicKey, type Transaction } from "@solana/web3.js";

// eslint-disable-next-line @typescript-eslint/no-namespace
export module InstructionResult {
  export interface InitializeGame {
    gameAddress: PublicKey;
    transaction: Transaction;
  }
  export interface UpdateGame {
    transaction: Transaction;
  }
  export interface CreatePlayer {
    newPlayer: PublicKey;
    transaction: Transaction;
  }
  export interface UpdatePlayer {
    transaction: Transaction;
  }
  export interface AddGameAchievement {
    newAchievement: PublicKey;
    transaction: Transaction;
  }
  export interface AddLeaderBoard {
    newLeaderBoard: PublicKey;
    topEntries: PublicKey;
    transaction: Transaction;
  }
  export interface RegisterPlayerEntry {
    newList: PublicKey;
    transaction: Transaction;
  }
  export interface SubmitScore {
    transaction: Transaction;
  }
  export interface UpdateAchievement {
    transaction: Transaction;
  }
  export interface UnlockPlayerAchievement {
    newPlayerAchievement: PublicKey;
    transaction: Transaction;
  }
  export interface AddReward {
    newReward: PublicKey;
    transaction: Transaction;
  }
  export interface MintReward {
    newMint: PublicKey;
    transaction: Transaction;
  }
  export interface VerifyReward {
    transaction: Transaction;
  }
  export interface InitiateMerge {
    newMergeAccount: PublicKey;
    transaction: Transaction;
  }
  export interface RegisterMergeApproval {
    transaction: Transaction;
  }
}
