import { type PublicKey } from "@solana/web3.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

export class PlayerAccount {
  constructor(
    public readonly address: PublicKey,
    public readonly user: PublicKey,
    public readonly username: string,
    public readonly nftMeta: PublicKey
  ) {}

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

  public print(): ReadablePlayerAccountInfo {
    return {
      address: this.address.toBase58(),
      user: this.user.toBase58(),
      username: this.username,
      nftMeta: this.nftMeta.toBase58(),
    };
  }
}

interface ReadablePlayerAccountInfo {
  address: string;
  user: string;
  username: string;
  nftMeta: string;
}
