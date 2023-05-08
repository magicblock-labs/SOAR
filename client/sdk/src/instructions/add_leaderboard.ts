import { type Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import { deriveLeaderBoardAddress } from "../utils";
import BN  from "bn.js";

export type AddLeaderBoardArgs = {
  description: string,
  nftMeta: PublicKey,
}
type AddLeaderBoardAccounts = Soar["instructions"]["4"]["accounts"];

export const addLeaderBoard = async (
  program: Program<Soar>,
  payer: PublicKey,
  gameAddress: PublicKey,
  authority: PublicKey,
  description: string,
  nftMeta: PublicKey,
): Promise<TransactionInstruction> => {
  const gameAccount = await program.account.game.fetch(gameAddress);
  const id = (gameAccount.leaderboard as any as BN).addn(1);
  const newLeaderboard = deriveLeaderBoardAddress(id, gameAddress, program.programId)[0];

  return program.methods
    .addLeaderboard({description, nftMeta})
    .accounts({
      authority: authority,
      game: gameAddress,
      payer,
      leaderboard: newLeaderboard,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}