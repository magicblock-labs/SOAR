import { type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

export class PlayerAchievementAccount {
  constructor(
    public readonly address: PublicKey,
    public readonly player: PublicKey,
    public readonly achievement: PublicKey,
    public readonly timestamp: BN,
    public readonly unlocked: boolean,
    public readonly claimed: boolean,
    public readonly nftRewardMint: PublicKey | null
  ) {}

  public static fromIdlAccount(
    account: IdlAccounts<Soar>["playerAchievement"],
    address: PublicKey
  ): PlayerAchievementAccount {
    return new PlayerAchievementAccount(
      address,
      account.player,
      account.achievement,
      account.timestamp,
      account.unlocked,
      account.claimed,
      account.nftRewardMint
    );
  }

  public print(): ReadablePlayerAchievementInfo {
    return {
      address: this.address.toBase58(),
      player: this.player.toBase58(),
      achievement: this.achievement.toBase58(),
      timestamp: this.timestamp.toString(),
      unlocked: this.unlocked,
      claimed: this.claimed,
      nftRewardMint:
        this.nftRewardMint !== null
          ? this.nftRewardMint.toBase58()
          : this.nftRewardMint,
    };
  }
}

interface ReadablePlayerAchievementInfo {
  address: string;
  player: string;
  achievement: string;
  timestamp: string;
  unlocked: boolean;
  claimed: boolean;
  nftRewardMint: string | null;
}
