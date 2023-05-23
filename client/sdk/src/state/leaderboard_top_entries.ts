import { type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

export class TopEntriesAccount {
  constructor(
    public readonly address: PublicKey,
    public readonly isAscending: boolean,
    public readonly topScores: LeaderboardScore[]
  ) {}

  public static fromIdlAccount(
    account: IdlAccounts<Soar>["leaderTopEntries"],
    address: PublicKey
  ): TopEntriesAccount {
    return new TopEntriesAccount(
      address,
      account.isAscending,
      account.topScores
    );
  }

  public print(): {
    address: string;
    isAscending: boolean;
    topScores: Array<{
      user: string;
      entry: {
        score: string;
        timestamp: string;
      };
    }>;
  } {
    return {
      address: this.address.toBase58(),
      isAscending: this.isAscending,
      topScores: this.topScores.map((score) => printLeaderboardScore(score)),
    };
  }
}

interface LeaderboardScore {
  user: PublicKey;
  entry: {
    score: BN;
    timestamp: BN;
  };
}

const printLeaderboardScore = (
  raw: LeaderboardScore
): {
  user: string;
  entry: {
    score: string;
    timestamp: string;
  };
} => {
  return {
    user: raw.user.toBase58(),
    entry: {
      score: raw.entry.score.toString(),
      timestamp: raw.entry.score.toString(),
    },
  };
};
