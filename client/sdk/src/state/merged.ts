import { type PublicKey } from "@solana/web3.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

type IDLMergedAccount = IdlAccounts<Soar>["merged"];

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

export interface MergedAccountInfo {
  address: PublicKey;
  initiator: PublicKey;
  others: MergeInfo[];
  mergeComplete: boolean;
}
export interface ReadableMergedAccountInfo {
  address: string;
  initiator: string;
  others: ReadableMergeInfo[];
  mergeComplete: boolean;
}

export const mergedInfoFromIdlAccount = (
  account: IDLMergedAccount,
  address: PublicKey
): MergedAccountInfo => {
  return {
    address,
    ...account,
  };
};
export const printMergedInfo = (
  info: MergedAccountInfo
): ReadableMergedAccountInfo => {
  return {
    address: info.address.toBase58(),
    initiator: info.initiator.toBase58(),
    others: info.others.map((other) => toReadable(other)),
    mergeComplete: info.mergeComplete,
  };
};
