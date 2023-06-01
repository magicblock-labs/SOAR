import { type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

/** Class representing a deserialized on-chain `PlayerAchievement` account. */
export class PlayerAchievementAccount {
  private constructor(
    public readonly address: PublicKey,
    public readonly player: PublicKey,
    public readonly achievement: PublicKey,
    public readonly timestamp: BN,
    public readonly unlocked: boolean,
    public readonly claimed: boolean
  ) {}

  /** Create a new instance from an anchor-deserialized account. */
  public static fromIdlAccount(
    account: IdlAccounts<Soar>["playerAchievement"],
    address: PublicKey
  ): PlayerAchievementAccount {
    return new PlayerAchievementAccount(
      address,
      account.playerAccount,
      account.achievement,
      account.timestamp,
      account.unlocked,
      account.claimed
    );
  }

  /** Pretty print. */
  public pretty(): {
    address: string;
    player: string;
    achievement: string;
    timestamp: string;
    unlocked: boolean;
    claimed: boolean;
  } {
    return {
      address: this.address.toBase58(),
      player: this.player.toBase58(),
      achievement: this.achievement.toBase58(),
      timestamp: this.timestamp.toString(),
      unlocked: this.unlocked,
      claimed: this.claimed,
    };
  }
}
