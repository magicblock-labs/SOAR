import { type Program } from "@coral-xyz/anchor";
import {
  type AccountMeta,
  type PublicKey,
  type Keypair,
  type TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import BN from "bn.js";

export const mergePlayerAccountsInstruction = async (
  program: Program<Soar>,
  hint: BN,
  user: PublicKey,
  userPlayerAccount: PublicKey,
  mergeAccount: Keypair,
  others: AccountMeta[]
): Promise<TransactionInstruction> => {
  return program.methods
    .mergePlayerAccounts(new BN(hint))
    .accounts({
      user,
      playerInfo: userPlayerAccount,
      mergeAccount: mergeAccount.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .remainingAccounts(others)
    .signers([mergeAccount])
    .instruction();
};
