import { type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

export class PlayerEntryListAccount {
  constructor(
    public readonly address: PublicKey,
    public readonly playerInfo: PublicKey,
    public readonly leaderboard: PublicKey,
    public readonly allocCount: number,
    public readonly scores: ScoreEntry[]
  ) {}

  public static fromIdlAccount(
    account: IdlAccounts<Soar>["playerEntryList"],
    address: PublicKey
  ): PlayerEntryListAccount {
    return new PlayerEntryListAccount(
      address,
      account.playerInfo,
      account.leaderboard,
      account.allocCount,
      account.scores
    );
  }

  public print(): ReadablePlayerEntryListAccountInfo {
    return {
      address: this.address.toBase58(),
      playerInfo: this.playerInfo.toBase58(),
      leaderboard: this.leaderboard.toBase58(),
      allocCount: this.allocCount,
      scores: this.scores.map((score) => printScoreEntry(score)),
    };
  }
}

interface ReadablePlayerEntryListAccountInfo {
  address: string;
  playerInfo: string;
  leaderboard: string;
  allocCount: number;
  scores: ReadableScoreEntry[];
}

interface ScoreEntry {
  score: BN;
  timestamp: BN;
}
interface ReadableScoreEntry {
  score: string;
  timestamp: string;
}
const printScoreEntry = (entry: ScoreEntry): ReadableScoreEntry => {
  return {
    score: entry.score.toString(),
    timestamp: entry.timestamp.toString(),
  };
};
