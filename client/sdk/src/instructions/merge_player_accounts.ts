import { type Program } from "@coral-xyz/anchor";
import { derivePlayerInfoAddress } from "../utils";
import { AccountMeta, PublicKey, Keypair, TransactionInstruction, SystemProgram } from "@solana/web3.js";
import { type Soar } from "../idl/soar";
import BN from "bn.js";

export type MergePlayerInfoArgs = {
  hint: BN
}
type MergePlayerInfoAccounts = Soar["instructions"]["9"]["accounts"];

export const mergePlayerAccounts = async (
  program: Program<Soar>,
  user: PublicKey,
  others: PublicKey[],
): Promise<TransactionInstruction> => {
  const playerInfo = derivePlayerInfoAddress(user, program.programId)[0];
  let accounts: Array<AccountMeta> = new Array;
  let hint = 0;
  for (let key of others) {
    const playerInfo = derivePlayerInfoAddress(key, program.programId)[0];

    const keyMeta: AccountMeta = { pubkey: key, isSigner: true, isWritable: false };
    const infoMeta: AccountMeta = { pubkey: playerInfo, isSigner: false, isWritable: true };

    accounts.push(keyMeta);
    accounts.push(infoMeta);
    hint+=1;
  }

  const mergeAccount = Keypair.generate();
  
  return program.methods
    .mergePlayerAccounts(new BN(hint))
    .accounts({
      user,
      playerInfo,
      mergeAccount: mergeAccount.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .remainingAccounts(accounts)
    .signers([mergeAccount])
    .instruction();
}

