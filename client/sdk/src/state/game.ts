import { type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

type IDLGameAccount = IdlAccounts<Soar>["game"];
export interface GameAccountInfo {
  address: PublicKey;
  title: string;
  description: string;
  genre: Genre;
  gameType: GameType;
  nftMeta: PublicKey;
  achievementCount: BN;
  leaderboardCount: BN;
  auth: PublicKey[];
}
export interface ReadableGameAccountInfo {
  address: string;
  title: string;
  description: string;
  genre: Genre;
  gameType: GameType;
  nftMeta: string;
  achievementCount: string;
  leaderboardCount: string;
  auth: string[];
}

export const gameInfoFromIdlAccount = (
  account: IDLGameAccount,
  address: PublicKey
): GameAccountInfo => {
  return {
    address,
    title: account.meta.title,
    description: account.meta.description,
    genre: account.meta.genre,
    gameType: account.meta.gameType,
    nftMeta: account.meta.nftMeta,
    achievementCount: account.achievementCount,
    leaderboardCount: account.leaderboardCount,
    auth: account.auth,
  };
};
export const printGameInfo = (
  info: GameAccountInfo
): ReadableGameAccountInfo => {
  return {
    address: info.address.toBase58(),
    title: info.title,
    description: info.description,
    genre: info.genre,
    gameType: info.gameType,
    nftMeta: info.nftMeta.toBase58(),
    achievementCount: info.achievementCount.toString(),
    leaderboardCount: info.leaderboardCount.toString(),
    auth: info.auth.map((auth) => auth.toBase58()),
  };
};

export const enum GameType {
  Mobile = 0,
  Desktop = 1,
  Web = 2,
  Unspecified = 255,
}

export const enum Genre {
  RPG = 0,
  MMO = 1,
  Action = 2,
  Adventure = 3,
  Puzzle = 4,
  Casual = 5,
  Unspecified = 255,
}
