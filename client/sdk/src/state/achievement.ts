import { type PublicKey } from "@solana/web3.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Soar } from "../idl/soar";

type IDLAchievementAccount = IdlAccounts<Soar>["achievement"];
export interface AchievementAccountInfo {
  address: PublicKey;
  game: PublicKey;
  title: string;
  description: string;
  nftMeta: PublicKey;
  reward: Reward;
}
export interface Reward {
  x: number;
}
export interface ReadableAchievementInfo {
  address: string;
  game: string;
  title: string;
  description: string;
  nftMeta: string;
  reward: Reward;
}
export const achievementFromIdlAccount = (
  account: IDLAchievementAccount,
  address: PublicKey
): AchievementAccountInfo => {
  return {
    address,
    ...account,
  };
};
export const printAchievementInfo = (
  info: AchievementAccountInfo
): ReadableAchievementInfo => {
  return {
    address: info.address.toBase58(),
    game: info.game.toBase58(),
    title: info.title,
    description: info.description,
    nftMeta: info.nftMeta.toBase58(),
    reward: info.reward,
  };
};
