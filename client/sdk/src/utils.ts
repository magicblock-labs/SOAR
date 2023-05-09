import { PublicKey } from "@solana/web3.js";
import type BN from "bn.js";

const enum Seeds {
  GAME = "game",
  LEADER = "leaderboard",
  ACHIEVEMENT = "achievement",
  PLAYER = "player",
  ENTRY = "entry",
  PLAYER_ACHIEVEMENT = "player_achievement",
}

export const deriveGameAddress = (
  creator: PublicKey,
  programId: PublicKey
): [PublicKey, number] =>
  PublicKey.findProgramAddressSync(
    [Buffer.from(Seeds.GAME), creator.toBuffer()],
    programId
  );

export const deriveLeaderBoardAddress = (
  id: BN,
  game: PublicKey,
  programId: PublicKey
): [PublicKey, number] =>
  PublicKey.findProgramAddressSync(
    [Buffer.from(Seeds.LEADER), game.toBuffer(), id.toBuffer("le", 8)],
    programId
  );

export const deriveAchievementAddress = (
  game: PublicKey,
  title: string,
  programId: PublicKey
): [PublicKey, number] =>
  PublicKey.findProgramAddressSync(
    [Buffer.from(Seeds.ACHIEVEMENT), game.toBuffer(), Buffer.from(title)],
    programId
  );

export const derivePlayerInfoAddress = (
  user: PublicKey,
  programId: PublicKey
): [PublicKey, number] =>
  PublicKey.findProgramAddressSync(
    [Buffer.from(Seeds.PLAYER), user.toBuffer()],
    programId
  );

export const derivePlayerEntryListAddress = (
  playerInfo: PublicKey,
  leaderboard: PublicKey,
  programId: PublicKey
): [PublicKey, number] =>
  PublicKey.findProgramAddressSync(
    [Buffer.from(Seeds.ENTRY), playerInfo.toBuffer(), leaderboard.toBuffer()],
    programId
  );

export const derivePlayerAchievementAddress = (
  player: PublicKey,
  achievement: PublicKey,
  programId: PublicKey
): [PublicKey, number] =>
  PublicKey.findProgramAddressSync(
    [
      Buffer.from(Seeds.PLAYER_ACHIEVEMENT),
      player.toBuffer(),
      achievement.toBuffer(),
    ],
    programId
  );

export const zip = <T, U>(a: T[], b: U[], defaultB: U): Array<[T, U]> =>
  a.map((k, i) => {
    if (b.length <= i) return [k, defaultB];
    return [k, b[i]];
  });
