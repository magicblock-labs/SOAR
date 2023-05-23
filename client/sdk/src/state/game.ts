import { type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";
import { type SoarProgram } from "../soar.program";
import { GameClient } from "../soar.game";

export class GameAccount {
  public readonly address: PublicKey;
  public readonly meta: {
    title: string;
    description: string;
    genre: Genre;
    gameType: GameType;
    nftMeta: PublicKey;
  };

  public readonly achievementCount: BN;
  public readonly leaderboardCount: BN;
  public readonly auth: PublicKey[];

  protected constructor(
    _address: PublicKey,
    account: IdlAccounts<Soar>["game"]
  ) {
    this.address = _address;
    this.meta = account.meta;
    this.achievementCount = account.achievementCount;
    this.leaderboardCount = account.leaderboardCount;
    this.auth = account.auth;
  }

  public static fromIdlAccount(
    account: IdlAccounts<Soar>["game"],
    address: PublicKey
  ): GameAccount {
    return new GameAccount(address, account);
  }

  public async client(soar: SoarProgram): Promise<GameClient> {
    return new GameClient(soar, this.address, this);
  }

  public print(): {
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
  } {
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
