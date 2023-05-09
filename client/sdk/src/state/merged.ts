import { type PublicKey } from "@solana/web3.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

type IDLMergedAccount = IdlAccounts<Soar>["merged"];
export interface MergedAccountInfo {
  address: PublicKey;
  keys: PublicKey[];
}
export interface ReadableMergedAccountInfo {
  address: string;
  keys: string[];
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
    keys: info.keys.map((key) => key.toBase58()),
  };
};
