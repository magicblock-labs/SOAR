import { type Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import { derivePlayerInfoAddress, derivePlayerEntryListAddress } from "../utils";

type RegisterPlayerAccounts = Soar["instructions"]["7"]["accounts"];

export const registerPlayerEntry = async (
  program: Program<Soar>,
  user: PublicKey,
  leaderboard: PublicKey,
): Promise<TransactionInstruction> => {
  const playerInfo = derivePlayerInfoAddress(user, program.programId)[0];
  const list = derivePlayerEntryListAddress(playerInfo, leaderboard, program.programId)[0];
  const lbAccount = await program.account.leaderBoard.fetch(leaderboard);

  return program.methods
    .registerPlayer()
    .accounts({
      user,
      playerInfo,
      game: lbAccount.game,
      leaderboard,
      newList: list,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}

