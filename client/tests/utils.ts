import { 
  Connection, 
  Keypair, 
  PublicKey, 
  SystemProgram, 
  Transaction,
} from "@solana/web3.js";
import { 
  createMint,
  createAssociatedTokenAccountIdempotentInstruction, 
  getAssociatedTokenAddressSync,
  mintToChecked
} from "@solana/spl-token";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import fs from "fs";
import { SoarProgram } from "../sdk/src";

const KEYPAIR_PATH = process.cwd() + "/client/tests/fixtures/provider.json";
export const COLLECTION_URI = "https://raw.githubusercontent.com/magicblock-labs/SOAR/client/tests/fixtures/metadata/collection.json";
export const TEST1_URI = "https://raw.githubusercontent.com/magicblock-labs/SOAR/client/tests/fixtures/metadata/image_test1";

export const initializeTestMint = async (client: SoarProgram): Promise<{
  mint: PublicKey,
  authority: Keypair,
}> => {
  let mint = Keypair.generate();
  let mintAuthority = Keypair.generate();
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: client.provider.publicKey,
      toPubkey: mintAuthority.publicKey,
      lamports: 1_000_000_000,
    }),
  );
  await client.sendAndConfirmTransaction(transaction);
  const mintAddress = await createMint(
    client.provider.connection,
    mintAuthority,
    mintAuthority.publicKey,
    mintAuthority.publicKey,
    0 ,
    mint
  );
  return {
    mint: mintAddress,
    authority: mintAuthority
  };
}

export const mintToAccount = async(
  client: SoarProgram, 
  mint: PublicKey, 
  authority: Keypair, 
  to: PublicKey, 
  amount: number
) => {
  await mintToChecked(
    client.provider.connection,
    authority,
    mint,
    to,
    authority,
    amount * 1e0,
    0
  );
}

export const createTokenAccount = async (
  client: SoarProgram, 
  owner: PublicKey, 
  mint: PublicKey
): Promise<PublicKey> => {
  const tokenAccount = getAssociatedTokenAddressSync(mint, owner);
  const tx = new Transaction().add(
    createAssociatedTokenAccountIdempotentInstruction(
      client.provider.publicKey,
      tokenAccount,
      owner,
      mint,
    ),
  );
  await client.sendAndConfirmTransaction(tx);

  return tokenAccount;
}

export const initMetaplex = (connection: Connection): Metaplex => {
  const walletString = fs.readFileSync(KEYPAIR_PATH, { encoding: "utf8" });
  const secretKey = Buffer.from(JSON.parse(walletString));
  const keypair = Keypair.fromSecretKey(secretKey);

  return Metaplex.make(connection).use(keypairIdentity(keypair));
};

export const initTestCollectionNft = async (
  metaplex: Metaplex,
  uri: string,
  name: string,
): Promise<Keypair> => {
  const mint = Keypair.generate();

  await metaplex.nfts().create({
    uri,
    name,
    sellerFeeBasisPoints: 100,
    useNewMint: mint,
    isCollection: true,
  });

  return mint;
};

export const fetchMetadataAccount = async (soar: SoarProgram, mint: PublicKey): Promise<Metadata> => {
  const metadataPDA = soar.utils.deriveMetadataAddress(mint)[0];
  const account = await soar.provider.connection.getAccountInfo(metadataPDA);

  return Metadata.fromAccountInfo(account)[0];
}