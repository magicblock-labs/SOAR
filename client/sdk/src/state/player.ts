import { type PublicKey } from "@solana/web3.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

/** Class representing a deserialized on-chain `Player` account. */
export class PlayerAccount {
  private constructor(
    public readonly address: PublicKey,
    public readonly user: PublicKey,
    public readonly username: string,
    public readonly nftMeta: PublicKey
  ) {}

  /** Create a new instance from an anchor-deserialized account. */
  public static fromIdlAccount(
    account: IdlAccounts<Soar>["player"],
    address: PublicKey
  ): PlayerAccount {
    return new PlayerAccount(
      address,
      account.user,
      account.username,
      account.nftMeta
    );
  }

  /** Pretty print. */
  public pretty(): {
    address: string;
    user: string;
    username: string;
    nftMeta: string;
  } {
    return {
      address: this.address.toBase58(),
      user: this.user.toBase58(),
      username: this.username,
      nftMeta: this.nftMeta.toBase58(),
    };
  }
}
