import { type PublicKey } from "@solana/web3.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";
import type BN from "bn.js";

export class AchievementAccount {
  private constructor(
    public readonly address: PublicKey,
    public readonly game: PublicKey,
    public readonly id: BN,
    public readonly title: string,
    public readonly description: string,
    public readonly nftMeta: PublicKey,
    public readonly reward: PublicKey | null
  ) {}

  public static fromIdlAccount(
    account: IdlAccounts<Soar>["achievement"],
    address: PublicKey
  ): AchievementAccount {
    return new AchievementAccount(
      address,
      account.game,
      account.id,
      account.title,
      account.description,
      account.nftMeta,
      account.reward
    );
  }

  public pretty(): {
    address: string;
    game: string;
    id: string;
    title: string;
    description: string;
    nftMeta: string;
    reward: string | null;
  } {
    return {
      address: this.address.toBase58(),
      game: this.game.toBase58(),
      id: this.id.toString(),
      title: this.title,
      description: this.description,
      nftMeta: this.nftMeta.toBase58(),
      reward: this.reward !== null ? this.reward.toBase58() : this.reward,
    };
  }
}
