import { PublicKey } from "@solana/web3.js";
import { TOKEN_METADATA_PROGRAM_ID } from "./constants";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import type BN from "bn.js";

export const enum Seeds {
  GAME = "game",
  LEADER = "leaderboard",
  ACHIEVEMENT = "achievement",
  PLAYER = "player",
  PLAYER_SCORES = "player-scores-list",
  PLAYER_ACHIEVEMENT = "player-achievement",
  LEADER_TOP_ENTRIES = "top-scores",
  NFT_CLAIM = "nft-claim",
}

export class Utils {
  constructor(readonly programId: PublicKey) {}

  public deriveLeaderBoardAddress(
    id: BN,
    game: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(Seeds.LEADER), game.toBuffer(), id.toBuffer("le", 8)],
      this.programId
    );
  }

  public deriveLeaderTopEntriesAddress(
    leaderboard: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(Seeds.LEADER_TOP_ENTRIES), leaderboard.toBuffer()],
      this.programId
    );
  }

  public deriveAchievementAddress(
    id: BN,
    game: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(Seeds.ACHIEVEMENT), game.toBuffer(), id.toBuffer("le", 8)],
      this.programId
    );
  }

  public derivePlayerAddress(user: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(Seeds.PLAYER), user.toBuffer()],
      this.programId
    );
  }

  public derivePlayerScoresListAddress(
    user: PublicKey,
    leaderboard: PublicKey
  ): [PublicKey, number] {
    const player = this.derivePlayerAddress(user)[0];
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(Seeds.PLAYER_SCORES),
        player.toBuffer(),
        leaderboard.toBuffer(),
      ],
      this.programId
    );
  }

  public derivePlayerAchievementAddress(
    user: PublicKey,
    achievement: PublicKey
  ): [PublicKey, number] {
    const player = this.derivePlayerAddress(user)[0];
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(Seeds.PLAYER_ACHIEVEMENT),
        player.toBuffer(),
        achievement.toBuffer(),
      ],
      this.programId
    );
  }

  public deriveNftClaimAddress(
    reward: PublicKey,
    mint: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(Seeds.NFT_CLAIM), reward.toBuffer(), mint.toBuffer()],
      this.programId
    );
  }

  deriveMetadataAddress = (mint: PublicKey): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
  };

  deriveEditionAddress = (mint: PublicKey): [PublicKey, number] => {
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

  deriveAssociatedTokenAddress = (
    mint: PublicKey,
    user: PublicKey
  ): PublicKey => {
    return getAssociatedTokenAddressSync(mint, user);
  };

  zip = <T, U>(a: T[], b: U[], defaultB: U): Array<[T, U]> =>
    a.map((k, i) => {
      if (b.length <= i) return [k, defaultB];
      return [k, b[i]];
    });
}
