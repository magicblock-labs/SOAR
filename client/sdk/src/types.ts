import { type PublicKey, type Transaction } from "@solana/web3.js";
import { type GameType, type Genre } from "./state/game";
import type BN from "bn.js";

// eslint-disable-next-line @typescript-eslint/no-namespace
export module InstructionResult {
  export interface InitializeGame {
    newGame: PublicKey;
    transaction: Transaction;
  }
  export interface UpdateGame {
    transaction: Transaction;
  }
  export interface InitializePlayer {
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
    topEntries: PublicKey | null;
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
    oldReward: PublicKey | null;
    newReward: PublicKey;
    transaction: Transaction;
  }
  export interface ClaimNftReward {
    newMint: PublicKey;
    transaction: Transaction;
  }
  export interface ClaimFtReward {
    transaction: Transaction;
  }
  export interface VerifyReward {
    transaction: Transaction;
  }
  export interface InitiateMerge {
    newMerge: PublicKey;
    transaction: Transaction;
  }
  export interface RegisterMergeApproval {
    transaction: Transaction;
  }
  export interface UpdateLeaderboard {
    transaction: Transaction;
  }
}

export interface InitializeGameArgs {
  gameMeta: {
    title: string;
    description: string;
    genre: Genre;
    gameType: GameType;
    nftMeta: PublicKey;
  };
  authorities: PublicKey[];
}
export interface AddAchievementArgs {
  title: string;
  description: string;
  nftMeta: PublicKey;
}
export interface AddLeaderBoardArgs {
  description: string;
  nftMeta: PublicKey;
  decimals: number | null;
  minScore: BN | null;
  maxScore: BN | null;
  scoresToRetain: number;
  isAscending: boolean;
  allowMultipleScores: boolean;
}
export interface AddNftRewardArgs {
  availableRewards: BN;
  kind: {
    uri: string;
    name: string;
    symbol: string;
  };
}
export interface AddFtRewardArgs {
  availableRewards: BN;
  kind: {
    deposit: BN;
    amount: BN;
  };
}
export interface InitializePlayerArgs {
  username: string;
  nftMeta: PublicKey;
}
export interface InitMergeArgs {
  keys: PublicKey[];
}
export interface SubmitScoreArgs {
  score: BN;
}
export interface UpdateAchievementArgs {
  newTitle: string | null;
  newDescription: string | null;
  newNftMeta: PublicKey | null;
}
export interface UpdateGameArgs {
  newMeta: {
    title: string;
    description: string;
    genre: Genre;
    gameType: GameType;
    nftMeta: PublicKey;
  } | null;
  newAuths: PublicKey[] | null;
}
export interface UpdateLeaderboardArgs {
  newDescription: string | null;
  newNftMeta: PublicKey | null;
  newMinScore: BN | null;
  newMaxScore: BN | null;
  newIsAscending: boolean | null;
  newAllowMultipleScores: boolean | null;
}
export interface UpdatePlayerArgs {
  newUsername: string | null;
  newNftMeta: PublicKey | null;
}
