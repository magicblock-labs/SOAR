import { PublicKey } from "@solana/web3.js";
import { TOKEN_METADATA_PROGRAM_ID } from "./constants";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

export const enum Seeds {
  GAME = "game",
  LEADER = "leaderboard",
  ACHIEVEMENT = "achievement",
  PLAYER = "player",
  ENTRY = "entry",
  PLAYER_ACHIEVEMENT = "player_achievement",
  REWARD = "reward",
  LEADER_TOP_ENTRIES = "top-scores",
}

export const deriveMetadataAddress = (mint: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
};

export const deriveEditionAddress = (mint: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from("edition"),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
};

export const deriveAssociatedTokenAddress = (
  mint: PublicKey,
  user: PublicKey
): PublicKey => {
  return getAssociatedTokenAddressSync(mint, user);
};

export const zip = <T, U>(a: T[], b: U[], defaultB: U): Array<[T, U]> =>
  a.map((k, i) => {
    if (b.length <= i) return [k, defaultB];
    return [k, b[i]];
  });
