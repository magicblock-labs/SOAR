import { type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

/** Class representing a deserialized on-chain `Leaderboard` account. */
export class LeaderBoardAccount {
  private constructor(
    public readonly address: PublicKey,
    public readonly id: BN,
    public readonly game: PublicKey,
    public readonly description: string,
    public readonly nftMeta: PublicKey,
    public readonly decimals: number,
    public readonly minScore: BN,
    public readonly maxScore: BN,
    public readonly topEntries: PublicKey | null
  ) {}

  /** Create a new instance from an anchor-deserialized account. */
  public static fromIdlAccount(
    account: IdlAccounts<Soar>["leaderBoard"],
    address: PublicKey
  ): LeaderBoardAccount {
    return new LeaderBoardAccount(
      address,
      account.id,
      account.game,
      account.description,
      account.nftMeta,
      account.decimals,
      account.minScore,
      account.maxScore,
      account.topEntries
    );
  }

  /** Pretty print. */
  public pretty(): {
    address: string;
    id: string;
    game: string;
    description: string;
    nftMeta: string;
    decimals: number;
    minScore: string;
    maxScore: string;
    topEntries: string | null;
  } {
    return {
      address: this.address.toBase58(),
      id: this.id.toString(),
      game: this.game.toBase58(),
      description: this.description,
      nftMeta: this.nftMeta.toBase58(),
      decimals: this.decimals,
      minScore: this.minScore.toString(),
      maxScore: this.maxScore.toString(),
      topEntries: this.topEntries ? this.topEntries.toBase58() : null,
    };
  }
}
