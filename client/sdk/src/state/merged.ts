import { type PublicKey } from "@solana/web3.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

export class MergedAccount {
  private constructor(
    public readonly address: PublicKey,
    public readonly initiator: PublicKey,
    public readonly approvals: MergeApproval[],
    public readonly mergeComplete: boolean
  ) {}

  public static fromIdlAccount(
    account: IdlAccounts<Soar>["merged"],
    address: PublicKey
  ): MergedAccount {
    return new MergedAccount(
      address,
      account.initiator,
      account.approvals,
      account.mergeComplete
    );
  }

  public pretty(): {
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
      others: this.approvals.map((approval) => printMergeApproval(approval)),
      mergeComplete: this.mergeComplete,
    };
  }
}

interface MergeApproval {
  key: PublicKey;
  approved: boolean;
}

const printMergeApproval = (
  raw: MergeApproval
): {
  key: string;
  approved: boolean;
} => {
  return {
    key: raw.key.toBase58(),
    approved: raw.approved,
  };
};
