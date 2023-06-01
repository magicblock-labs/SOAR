import { type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

/** Class representing a deserialized on-chain `Reward` account. */
export class RewardAccount {
  private constructor(
    public readonly address: PublicKey,
    public readonly achievement: PublicKey,
    public readonly availableSpots: BN,
    public readonly FungibleToken:
      | {
          mint: PublicKey;
          account: PublicKey;
          amount: BN;
        }
      | undefined,
    public readonly NonFungibleToken:
      | {
          uri: string;
          name: string;
          symbol: string;
          minted: BN;
          collection: PublicKey | null;
        }
      | undefined
  ) {}

  /** Create a new instance from an anchor-deserialized account. */
  public static fromIdlAccount(
    account: IdlAccounts<Soar>["reward"],
    address: PublicKey
  ): RewardAccount {
    return new RewardAccount(
      address,
      account.achievement,
      account.availableSpots,
      account.reward.fungibleToken,
      account.reward.nonFungibleToken
    );
  }

  /** Pretty print. */
  public pretty(): {
    address: string;
    achievement: string;
    availableSpots: string;
    FungibleToken:
      | {
          mint: string;
          account: string;
          amount: string;
        }
      | undefined;
    NonFungibleToken:
      | {
          uri: string;
          name: string;
          symbol: string;
          minted: string;
          collection: string | null;
        }
      | undefined;
  } {
    return {
      address: this.address.toBase58(),
      achievement: this.achievement.toBase58(),
      availableSpots: this.availableSpots.toString(),
      FungibleToken:
        this.FungibleToken !== undefined
          ? {
              mint: this.FungibleToken.mint.toBase58(),
              account: this.FungibleToken.account.toBase58(),
              amount: this.FungibleToken.amount.toString(),
            }
          : undefined,
      NonFungibleToken:
        this.NonFungibleToken !== undefined
          ? {
              uri: this.NonFungibleToken.uri,
              name: this.NonFungibleToken.name,
              symbol: this.NonFungibleToken.symbol,
              minted: this.NonFungibleToken.minted.toString(),
              collection:
                this.NonFungibleToken.collection !== null
                  ? this.NonFungibleToken.collection.toBase58()
                  : null,
            }
          : undefined,
    };
  }
}
