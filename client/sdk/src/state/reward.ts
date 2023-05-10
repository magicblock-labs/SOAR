import { type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

type IDLRewardAccount = IdlAccounts<Soar>["reward"];
export interface RewardAccountInfo {
  address: PublicKey;
  achievement: PublicKey;
  uri: string;
  name: string;
  symbol: string;
  minted: BN;
  collectionMint: PublicKey | null;
}
export interface ReadableRewardAccountInfo {
  address: string;
  achievement: string;
  uri: string;
  name: string;
  symbol: string;
  minted: string;
  collectionMint: string | null;
}
export const rewardInfoFromIdlAccount = (
  account: IDLRewardAccount,
  address: PublicKey
): RewardAccountInfo => {
  return {
    address,
    ...account,
  };
};
export const printRewardAccountInfo = (
  info: RewardAccountInfo
): ReadableRewardAccountInfo => {
  return {
    address: info.address.toBase58(),
    achievement: info.achievement.toBase58(),
    uri: info.uri,
    name: info.name,
    symbol: info.symbol,
    minted: info.minted.toString(),
    collectionMint:
      info.collectionMint !== null
        ? info.collectionMint.toBase58()
        : info.collectionMint,
  };
};
