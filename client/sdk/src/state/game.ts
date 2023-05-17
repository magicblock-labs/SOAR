import { type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

export class GameAccount {
  constructor(
    public readonly address: PublicKey,
    public readonly meta: {
      title: string;
      description: string;
      genre: Genre;
      gameType: GameType;
      nftMeta: PublicKey;
    },
    public readonly achievementCount: BN,
    public readonly leaderboardCount: BN,
    public readonly auth: PublicKey[]
  ) {}

  public static fromIdlAccount(
    account: IdlAccounts<Soar>["game"],
    address: PublicKey
  ): GameAccount {
    return new GameAccount(
      address,
      account.meta,
      account.achievementCount,
      account.leaderboardCount,
      account.auth
    );
  }

  public print(): ReadableGameAccountInfo {
    return {
      address: this.address.toBase58(),
      meta: {
        ...this.meta,
        nftMeta: this.meta.nftMeta.toBase58(),
      },
      achievementCount: this.achievementCount.toString(),
      leaderboardCount: this.leaderboardCount.toString(),
      auth: this.auth.map((auth) => auth.toBase58()),
    };
  }
}

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

interface ReadableGameAccountInfo {
  address: string;
  meta: {
    title: string;
    description: string;
    genre: Genre;
    gameType: GameType;
    nftMeta: string;
  };
  achievementCount: string;
  leaderboardCount: string;
  auth: string[];
}
