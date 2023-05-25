import { type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

export class PlayerScoresListAccount {
  private constructor(
    public readonly address: PublicKey,
    public readonly playerAccount: PublicKey,
    public readonly leaderboard: PublicKey,
    public readonly allocCount: number,
    public readonly scores: ScoreEntry[]
  ) {}

  public static fromIdlAccount(
    account: IdlAccounts<Soar>["playerScoresList"],
    address: PublicKey
  ): PlayerScoresListAccount {
    return new PlayerScoresListAccount(
      address,
      account.playerAccount,
      account.leaderboard,
      account.allocCount,
      account.scores
    );
  }

  public pretty(): {
    address: string;
    playerInfo: string;
    leaderboard: string;
    allocCount: number;
    scores: Array<{
      score: string;
      timestamp: string;
    }>;
  } {
    return {
      address: this.address.toBase58(),
      playerInfo: this.playerAccount.toBase58(),
      leaderboard: this.leaderboard.toBase58(),
      allocCount: this.allocCount,
      scores: this.scores.map((score) => printScoreEntry(score)),
    };
  }
}

interface ScoreEntry {
  score: BN;
  timestamp: BN;
}

const printScoreEntry = (
  entry: ScoreEntry
): {
  score: string;
  timestamp: string;
} => {
  return {
    score: entry.score.toString(),
    timestamp: entry.timestamp.toString(),
  };
};
