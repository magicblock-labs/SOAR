import { type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

/** Class representing a deserialized on-chain `LeaderTopScores` account. */
export class TopEntriesAccount {
  constructor(
    public readonly address: PublicKey,
    public readonly isAscending: boolean,
    public readonly topScores: LeaderboardScore[]
  ) {}

  /** Create a new instance from an anchor-deserialized account. */
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

  /** Pretty print. */
  public pretty(): {
    address: string;
    isAscending: boolean;
    topScores: Array<{
      player: string;
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
  player: PublicKey;
  entry: {
    score: BN;
    timestamp: BN;
  };
}

const printLeaderboardScore = (
  raw: LeaderboardScore
): {
  player: string;
  entry: {
    score: string;
    timestamp: string;
  };
} => {
  return {
    player: raw.player.toBase58(),
    entry: {
      score: raw.entry.score.toString(),
      timestamp: raw.entry.score.toString(),
    },
  };
};
