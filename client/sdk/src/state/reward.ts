import { type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

export class RewardAccount {
  constructor(
    public readonly address: PublicKey,
    public readonly achievement: PublicKey,
    public readonly uri: string,
    public readonly name: string,
    public readonly symbol: string,
    public readonly minted: BN,
    public readonly collectionMint: PublicKey | null
  ) {}

  public static fromIdlAccount(
    account: IdlAccounts<Soar>["reward"],
    address: PublicKey
  ): RewardAccount {
    return new RewardAccount(
      address,
      account.achievement,
      account.uri,
      account.name,
      account.symbol,
      account.minted,
      account.collectionMint
    );
  }

  public print(): ReadableRewardAccountInfo {
    return {
      address: this.address.toBase58(),
      achievement: this.achievement.toBase58(),
      uri: this.uri,
      name: this.name,
      symbol: this.symbol,
      minted: this.minted.toString(),
      collectionMint:
        this.collectionMint !== null
          ? this.collectionMint.toBase58()
          : this.collectionMint,
    };
  }
}

interface ReadableRewardAccountInfo {
  address: string;
  achievement: string;
  uri: string;
  name: string;
  symbol: string;
  minted: string;
  collectionMint: string | null;
}
