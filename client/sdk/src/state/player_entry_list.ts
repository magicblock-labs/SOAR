import { type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

type IDLPlayerEntryListAccount = IdlAccounts<Soar>["playerEntryList"];
export interface PlayerEntryListAccountInfo {
  address: PublicKey;
  playerInfo: PublicKey;
  leaderboard: PublicKey;
  scoreCount: BN;
  scores: ScoreEntry[];
}
export interface ReadablePlayerEntryListInfo {
  address: string;
  playerInfo: string;
  leaderboard: string;
  scoreCount: string;
  scores: ReadableScoreEntry[];
}
export const playerEntryListFromIdlAccount = (
  account: IDLPlayerEntryListAccount,
  address: PublicKey
): PlayerEntryListAccountInfo => {
  return {
    address,
    ...account,
  };
};
export const printPlayerEntryListInfo = (
  info: PlayerEntryListAccountInfo
): ReadablePlayerEntryListInfo => {
  return {
    address: info.address.toBase58(),
    playerInfo: info.playerInfo.toBase58(),
    leaderboard: info.leaderboard.toBase58(),
    scoreCount: info.scoreCount.toString(),
    scores: info.scores.map((score) => printScoreEntry(score)),
  };
};

export interface ScoreEntry {
  score: BN;
  timestamp: BN;
}
export interface ReadableScoreEntry {
  score: string;
  timestamp: string;
}
export const printScoreEntry = (entry: ScoreEntry): ReadableScoreEntry => {
  return {
    score: entry.score.toString(),
    timestamp: entry.timestamp.toString(),
  };
};
