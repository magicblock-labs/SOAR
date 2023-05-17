import { type PublicKey } from "@solana/web3.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

export class MergedAccount {
  constructor(
    public readonly address: PublicKey,
    public readonly initiator: PublicKey,
    public readonly others: MergeInfo[],
    public readonly mergeComplete: boolean
  ) {}

  public static fromIdlAccount(
    account: IdlAccounts<Soar>["merged"],
    address: PublicKey
  ): MergedAccount {
    return new MergedAccount(
      address,
      account.initiator,
      account.others,
      account.mergeComplete
    );
  }

  public print(): ReadableMergedAccountInfo {
    return {
      address: this.address.toBase58(),
      initiator: this.initiator.toBase58(),
      others: this.others.map((other) => toReadable(other)),
      mergeComplete: this.mergeComplete,
    };
  }
}

interface ReadableMergedAccountInfo {
  address: string;
  initiator: string;
  others: ReadableMergeInfo[];
  mergeComplete: boolean;
}
interface MergeInfo {
  key: PublicKey;
  approved: boolean;
}
interface ReadableMergeInfo {
  key: string;
  approved: boolean;
}
const toReadable = (raw: MergeInfo): ReadableMergeInfo => {
  return {
    key: raw.key.toBase58(),
    approved: raw.approved,
  };
};
