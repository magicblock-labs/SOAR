import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { IDL, Soar } from "./idl/soar";
import { PROGRAM_ID } from "./constants";
import BN from "bn.js";
import { 
  addLeaderBoard,
  addAchievement,
  createPlayer,
  initializeGame, 
  mergePlayerAccounts,
  registerPlayerEntry,
  submitScore,
  updateAchievement,
  updateGame,
} from "./instructions";
import { GameMeta } from "./state/accounts";

export class SoarClient {
  readonly program: Program<Soar>;
  
  private constructor(readonly provider: AnchorProvider) {
    this.program = new Program<Soar>(IDL, PROGRAM_ID, provider);
  }

  public async initializeGame(
    title: string, 
    description: string, 
    genre: string, 
    gameType: string,
    nftMeta: PublicKey,
    authorities: PublicKey[],
  ): Promise<Transaction> {
    const transaction = new Transaction();

    const initGame = await initializeGame(
      this.program, 
      this.provider.publicKey,
      title,
      description,
      genre,
      gameType,
      nftMeta,
      authorities
    );

    return transaction.add(initGame);
  }

  public async initializePlayer(
    username: string,
    nftMeta: PublicKey,
  ): Promise<Transaction> {
    const transaction = new Transaction();

    const initPlayer = await createPlayer(
      this.program,
      this.provider.publicKey,
      username,
      nftMeta
    );

    return transaction.add(initPlayer);
  }

  public async addAchievement(
    game: PublicKey,
    authority: PublicKey,
    title: string,
    description: string,
    nftMeta: PublicKey,
  ): Promise<Transaction> {
    const transaction = new Transaction();

    const add = await addAchievement(
      this.program,
      game,
      this.provider.publicKey,
      authority,
      title,
      description,
      nftMeta,
    );

    return transaction.add(add);
  }    

  public async addLeaderBoard(
    game: PublicKey,
    authority: PublicKey,
    description: string,
    nftMeta: PublicKey
  ): Promise<Transaction> {
    const transaction = new Transaction();

    const addBoard = await addLeaderBoard(
      this.program,
      this.provider.publicKey,
      game,
      authority,
      description,
      nftMeta
    );

    return transaction.add(addBoard);
  }

  public async mergePlayerAccounts(
    accounts: PublicKey[]
  ): Promise<Transaction> {
    const transaction = new Transaction();

    const merge = await mergePlayerAccounts(
      this.program,
      this.provider.publicKey,
      accounts
    );

    return transaction.add(merge);
  }

  public async registerPlayerEntry(
    leaderboard: PublicKey,
  ): Promise<Transaction> {
    const transaction = new Transaction();

    const register = await registerPlayerEntry(
      this.program,
      this.provider.publicKey,
      leaderboard,
    );

    return transaction.add(register);
  }

  public async submitScore(
    authority: PublicKey,
    game: PublicKey,
    score: BN,
    rank: BN | null,
  ): Promise<Transaction> {
    const transaction = new Transaction();

    const submit = await submitScore(
      this.program,
      this.provider.publicKey,
      authority,
      game,
      score,
      rank,
    );

    return transaction.add(submit);
  }

  public async updateAchievement(
    authority: PublicKey,
    achievement: PublicKey,
    newTitle: string | null,
    newDescription: string | null,
    newNftMeta: PublicKey | null,
  ): Promise<Transaction> {
    const transaction = new Transaction();

    const update = await updateAchievement(
      this.program,
      achievement,
      authority,
      newTitle,
      newDescription,
      newNftMeta,
    );

    return transaction.add(update);
  }

  public async updateGame(
    game: PublicKey,
    authority: PublicKey,
    newMeta: GameMeta | null,
    newAuths: PublicKey[] | null,
  ): Promise<Transaction> {
    const transaction = new Transaction();

    const update = await updateGame(
      this.program,
      this.provider.publicKey,
      game,
      authority,
      newMeta,
      newAuths,
    );

    return transaction.add(update);
  }
}

