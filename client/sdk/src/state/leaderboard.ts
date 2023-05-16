import { type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

type IDLLeaderBoardAccount = IdlAccounts<Soar>["leaderBoard"];
export interface LeaderBoardAccountInfo {
  address: PublicKey;
  id: BN;
  game: PublicKey;
  description: string;
  nftMeta: PublicKey;
  decimals: number;
  minScore: BN;
  maxScore: BN;
  topEntries: PublicKey | null;
}
export interface ReadableLeaderBoardAccountInfo {
  address: string;
  id: string;
  game: string;
  description: string;
  nftMeta: string;
  decimals: number;
  minScore: string;
  maxScore: string;
  topEntries: string | null;
}
export const leaderBoardInfoFromIdlAccount = (
  account: IDLLeaderBoardAccount,
  address: PublicKey
): LeaderBoardAccountInfo => {
  return {
    address,
    ...account,
  };
};
export const printLeaderBoardInfo = (
  info: LeaderBoardAccountInfo
): ReadableLeaderBoardAccountInfo => {
  return {
    address: info.address.toBase58(),
    id: info.id.toString(),
    game: info.game.toBase58(),
    description: info.description,
    nftMeta: info.nftMeta.toBase58(),
    decimals: info.decimals,
    minScore: info.minScore.toString(),
    maxScore: info.maxScore.toString(),
    topEntries: info.topEntries ? info.topEntries.toBase58() : null,
  };
};

type IDLLeaderTopEntriesAccount = IdlAccounts<Soar>["leaderTopEntries"];
export interface LeaderTopEntriesAccountInfo {
  address: PublicKey;
  isAscending: boolean;
  topScores: LeaderboardScore[];
}
export interface ReadableLeaderTopEntriesAccountInfo {
  address: string;
  isAscending: boolean;
  topScores: ReadableLeaderboardScore[];
}
interface LeaderboardScore {
  user: PublicKey;
  entry: {
    score: BN;
    timestamp: BN;
  };
}
interface ReadableLeaderboardScore {
  user: string;
  entry: {
    score: string;
    timestamp: string;
  };
}
const toReadable = (raw: LeaderboardScore): ReadableLeaderboardScore => {
  return {
    user: raw.user.toBase58(),
    entry: {
      score: raw.entry.score.toString(),
      timestamp: raw.entry.score.toString(),
    },
  };
};

export const leaderTopEntriesFromIdlAccount = (
  account: IDLLeaderTopEntriesAccount,
  address: PublicKey
): LeaderTopEntriesAccountInfo => {
  return {
    address,
    ...account,
  };
};
export const printLeaderTopEntriesInfo = (
  info: LeaderTopEntriesAccountInfo
): ReadableLeaderTopEntriesAccountInfo => {
  return {
    address: info.address.toBase58(),
    isAscending: info.isAscending,
    topScores: info.topScores.map((score) => toReadable(score)),
  };
};
