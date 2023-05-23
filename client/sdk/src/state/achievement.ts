import { type PublicKey } from "@solana/web3.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

export class AchievementAccount {
  private constructor(
    public readonly address: PublicKey,
    public readonly game: PublicKey,
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
      account.title,
      account.description,
      account.nftMeta,
      account.reward
    );
  }

  public print(): {
    address: string;
    game: string;
    title: string;
    description: string;
    nftMeta: string;
    reward: string | null;
  } {
    return {
      address: this.address.toBase58(),
      game: this.game.toBase58(),
      title: this.title,
      description: this.description,
      nftMeta: this.nftMeta.toBase58(),
      reward: this.reward !== null ? this.reward.toBase58() : this.reward,
    };
  }
}
