import { type PublicKey } from "@solana/web3.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

export class MergedAccount {
  private constructor(
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

  public print(): {
    address: string;
    initiator: string;
    others: Array<{
      key: string;
      approved: boolean;
    }>;
    mergeComplete: boolean;
  } {
    return {
      address: this.address.toBase58(),
      initiator: this.initiator.toBase58(),
      others: this.others.map((other) => printMergeInfo(other)),
      mergeComplete: this.mergeComplete,
    };
  }
}

interface MergeInfo {
  key: PublicKey;
  approved: boolean;
}

const printMergeInfo = (
  raw: MergeInfo
): {
  key: string;
  approved: boolean;
} => {
  return {
    key: raw.key.toBase58(),
    approved: raw.approved,
  };
};
