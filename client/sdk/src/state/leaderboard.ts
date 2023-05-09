import { type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

type IDLLeaderBoardAccount = IdlAccounts<Soar>["leaderBoard"];
export interface LeaderBoardAccountInfo {
  address: PublicKey;
  id: BN;
  game: PublicKey;
  description: string;
  nftMeta: PublicKey;
}
export interface ReadableLeaderBoardAccountInfo {
  address: string;
  id: string;
  game: string;
  description: string;
  nftMeta: string;
}
export const leaderBoardInfoFromIdlAccount = (
  account: IDLLeaderBoardAccount,
  address: PublicKey
): LeaderBoardAccountInfo => {
  return {
    address,
    ...account,
  };
};
export const printLeaderBoardInfo = (
  info: LeaderBoardAccountInfo
): ReadableLeaderBoardAccountInfo => {
  return {
    address: info.address.toBase58(),
    id: info.id.toString(),
    game: info.game.toBase58(),
    description: info.description,
    nftMeta: info.nftMeta.toBase58(),
  };
};
