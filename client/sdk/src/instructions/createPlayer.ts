import { type Program } from "@coral-xyz/anchor";
import {
  type PublicKey,
  SystemProgram,
  type TransactionInstruction,
} from "@solana/web3.js";
import { type Soar } from "../idl/soar";

export const createPlayerInstruction = async (
  program: Program<Soar>,
  newPlayerInfo: PublicKey,
  user: PublicKey,
  payer: PublicKey,
  username: string,
  nftMeta: PublicKey
): Promise<TransactionInstruction> => {
  const accounts = {
    user,
    payer,
    playerInfo: newPlayerInfo,
    systemProgram: SystemProgram.programId,
  };
  return program.methods
    .createPlayer(username, nftMeta)
    .accounts(accounts)
    .instruction();
};
