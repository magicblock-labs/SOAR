import { type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

type IDLPlayerAccount = IdlAccounts<Soar>["player"];
export interface PlayerAccountInfo {
  address: PublicKey;
  user: PublicKey;
  username: string;
  rank: BN;
  nftMeta: PublicKey;
}
export interface ReadablePlayerAccountInfo {
  address: string;
  user: string;
  username: string;
  rank: string;
  nftMeta: string;
}
export const playerInfoFromIdlAccount = (
  account: IDLPlayerAccount,
  address: PublicKey
): PlayerAccountInfo => {
  return {
    address,
    ...account,
  };
};
export const printPlayerInfo = (
  info: PlayerAccountInfo
): ReadablePlayerAccountInfo => {
  return {
    address: info.address.toBase58(),
    user: info.user.toBase58(),
    username: info.username,
    rank: info.rank.toString(),
    nftMeta: info.nftMeta.toBase58(),
  };
};
