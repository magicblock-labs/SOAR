import { type PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export type GameAccount = {
  meta: GameMeta,
  leaderboard: BN,
  auth: PublicKey[],
}

export type GameMeta = {
  title: string,
  description: string,
  genre: string,
  gameType: string,
  nftMeta: PublicKey,
}

export type LeaderBoardAccount = {
  id: BN,
  game: PublicKey,
  description: string,
  nftMeta: PublicKey,
}

export type PlayerInfoAccount = {
  user: PublicKey,
  username: string,
  rank: BN,
  nft_meta: PublicKey,
  merged: PublicKey,
}

export type MergedAccount = {
  keys: PublicKey[]
}

export type PlayerEntryListAccount = {
  playerInfo: PublicKey,
  leaderboard: PublicKey,
  scoreCount: PublicKey,
  scores: ScoreEntry[],
}

export type ScoreEntry = {
  score: BN,
  timestamp: BN,
}

export type PlayerAchievementAccount = {
  player: PublicKey,
  description: PublicKey,
  timestamp: BN,
  status: boolean
}