import { type PublicKey } from "@solana/web3.js";
import type BN from "bn.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

type IDLPlayerAchievementAccount = IdlAccounts<Soar>["playerAchievement"];
export interface PlayerAchievementAccountInfo {
  address: PublicKey;
  player: PublicKey;
  timestamp: BN;
  unlocked: boolean;
  metadata: PublicKey | null;
}
export interface ReadablePlayerAchievementInfo {
  address: string;
  player: string;
  timestamp: string;
  unlocked: boolean;
  metadata: string | null;
}
export const playerAchievementFromIdlAccount = (
  account: IDLPlayerAchievementAccount,
  address: PublicKey
): PlayerAchievementAccountInfo => {
  return {
    address,
    ...account,
  };
};
export const printPlayerAchievementInfo = (
  info: PlayerAchievementAccountInfo
): ReadablePlayerAchievementInfo => {
  return {
    address: info.address.toBase58(),
    player: info.player.toBase58(),
    timestamp: info.timestamp.toString(),
    unlocked: info.unlocked,
    metadata: info.metadata !== null ? info.metadata.toBase58() : info.metadata,
  };
};
