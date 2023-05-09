import { type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

type IDLGameAccount = IdlAccounts<Soar>["game"];
export interface GameAccountInfo {
  address: PublicKey;
  title: string;
  description: string;
  genre: string;
  gameType: string;
  nftMeta: PublicKey;
  leaderboardId: BN;
  auth: PublicKey[];
}
export interface ReadableGameAccountInfo {
  address: string;
  title: string;
  description: string;
  genre: string;
  gameType: string;
  nftMeta: string;
  leaderboardId: string;
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
    leaderboardId: account.leaderboard as any as BN,
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
    leaderboardId: info.leaderboardId.toString(),
    auth: info.auth.map((auth) => auth.toBase58()),
  };
};
