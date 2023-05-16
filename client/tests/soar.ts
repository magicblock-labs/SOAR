import * as anchor from "@coral-xyz/anchor";
import { expect, assert } from "chai";
import { PublicKey, Keypair, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { SoarProgram, Game, gameInfoFromIdlAccount, Genre, GameType} from "../sdk/src";
import BN from "bn.js";

describe("soar", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  /*before(async () => {
    // fund the provider
    await provider.connection
      .requestAirdrop(provider.publicKey, 100 * LAMPORTS_PER_SOL)
      .then(async (sig) => provider.connection.confirmTransaction(sig));
  });*/

  const client = SoarProgram.get(provider);

  // Fixtures
  let game: Game;
  let game1 = Keypair.generate();
  let game1Auths = [Keypair.generate(), Keypair.generate()];

  let user1 = Keypair.generate();
  let user2 = Keypair.generate();
  let user3 = Keypair.generate();

  it("Registers a game and checks for correct parameters", async () => {
    let title = "Game1";
    let description = "testDescription";
    let genre = Genre.Action;
    let gameType = GameType.Web; 
    let nftMeta = Keypair.generate().publicKey;
    let auths = game1Auths.map((keypair) => keypair.publicKey);

    let { gameAddress, transaction } = await client.initializeNewGame(game1, title, description, genre, gameType, nftMeta, auths);
    await client.sendAndConfirmTransaction(transaction, [game1]);

    let raw = await client.program.account.game.fetch(gameAddress);
    let info = gameInfoFromIdlAccount(raw, gameAddress);

    expect(info.title).to.equal(title);
    expect(info.description).to.equal(description);
    expect(info.genre).to.equal(genre);
    expect(info.gameType).to.equal(gameType);
    expect(info.nftMeta.toBase58()).to.equal(nftMeta.toBase58());
    expect(info.leaderboardCount.toNumber()).to.equal(0);
  });

  it("Registers players and checks for the correct parameters", async () => {
    let player1Username = "player1xx";
    let player1Pfp = Keypair.generate().publicKey;

    let { newPlayer: p1, transaction: t1 } = await client.initializePlayerAccount(user1.publicKey, player1Username, player1Pfp);
    await client.sendAndConfirmTransaction(t1, [user1]);
    let { transaction: t2 } = await client.initializePlayerAccount(user2.publicKey, "random", PublicKey.default);
    await client.sendAndConfirmTransaction(t2, [user2]);
    let { transaction: t3 } = await client.initializePlayerAccount(user3.publicKey, "xx", PublicKey.default);
    await client.sendAndConfirmTransaction(t3, [user3]);

    let playerAccount = await client.program.account.player.fetch(p1);
    expect(playerAccount.user.toBase58()).to.equal(user1.publicKey.toBase58());
    expect(playerAccount.username).to.equal(player1Username);
    expect(playerAccount.nftMeta.toBase58()).to.equal(player1Pfp.toBase58());
  })
});