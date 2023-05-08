import { type Program } from "@coral-xyz/anchor";
import { PublicKey, TransactionInstruction, SystemProgram } from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import { derivePlayerInfoAddress, derivePlayerEntryListAddress, deriveLeaderBoardAddress } from "../utils";
import BN from "bn.js";

export type SubmitScoreArgs = {
  score: BN,
  rank: BN | null,
}

type SubmitScoreAccounts = Soar["instructions"]["8"]["accounts"];

export const submitScore = async (
  program: Program<Soar>,
  user: PublicKey,
  authority: PublicKey,
  game: PublicKey,
  score: BN,
  rank: BN | null,
): Promise<TransactionInstruction> => {
  const gameAccount = await program.account.game.fetch(game);
  const leaderboardId = gameAccount.leaderboard as any as BN;
  const leaderboard = deriveLeaderBoardAddress(leaderboardId, game, program.programId)[0];

  // TODO: Add a pre-instruction that registers the player to the current leaderboard if 
  // they aren't already registered?
  const playerInfo = derivePlayerInfoAddress(user, program.programId)[0];
  const playerEntries = derivePlayerEntryListAddress(playerInfo, leaderboard, program.programId)[0];

  return program.methods
    .submitScore(score, rank)
    .accounts({
      user,
      authority: authority,
      playerInfo,
      game,
      leaderboard,
      playerEntries,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}

