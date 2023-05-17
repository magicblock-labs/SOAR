import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";
import { PublicKey, Keypair } from "@solana/web3.js";
import { SoarProgram, Game, GameType, Genre} from "../sdk/src";
import BN from "bn.js";

describe("soar", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const client = SoarProgram.get(provider);

  let gameClient: Game;
  let game = Keypair.generate();
  let auths = [Keypair.generate(), Keypair.generate()];
  let leaderBoards: PublicKey[] = [];
  let achievements: PublicKey[] = [];

  let user1 = Keypair.generate();
  let user2 = Keypair.generate();
  let user3 = Keypair.generate();

  it("Can register a game account with correct parameters", async () => {
    let title = "Game1";
    let description = "testDescription";
    let genre = Genre.Action;
    let gameType = GameType.Web; 
    let nftMeta = Keypair.generate().publicKey;
    let _auths = auths.map((keypair) => keypair.publicKey);

    let { gameAddress, transaction } = await client.initializeNewGame(game, title, description, genre, gameType, nftMeta, _auths);
    await client.sendAndConfirmTransaction(transaction, [game]);

    let info = await client.fetchGameAccount(gameAddress);

    expect(info.meta.title).to.equal(title);
    expect(info.meta.description).to.equal(description);
    expect(info.meta.genre).to.equal(genre);
    expect(info.meta.gameType).to.equal(gameType);
    expect(info.meta.nftMeta.toBase58()).to.equal(nftMeta.toBase58());
    expect(info.leaderboardCount.toNumber()).to.equal(0);

    expect(info.auth.length).to.equal(2);
    expect(info.auth[0].toBase58()).to.equal(auths[0].publicKey.toBase58());
    expect(info.auth[1].toBase58()).to.equal(auths[1].publicKey.toBase58());

    gameClient = await Game.get(gameAddress, provider);
  });

  it("Can update a game with the correct parameters", async() => {
    let newAuths = [Keypair.generate(), Keypair.generate(), Keypair.generate()];
    let { transaction }  = await gameClient.update(auths[0].publicKey, null, 
      newAuths.map((auth) => auth.publicKey));
    await client.sendAndConfirmTransaction(transaction, [auths[0]]);
    auths = newAuths;

    await gameClient.refresh();
    let authKeys = gameClient.state.auth;
    expect(authKeys.length).to.equal(3);
    expect(authKeys[0].toBase58()).to.equal(newAuths[0].publicKey.toBase58());
    expect(authKeys[1].toBase58()).to.equal(newAuths[1].publicKey.toBase58());
    expect(authKeys[2].toBase58()).to.equal(newAuths[2].publicKey.toBase58());
    
  });

  it("Can't update a game with the wrong authority", async() => {
    let wrong = Keypair.generate();
    let { transaction } = await gameClient.update(wrong.publicKey, null, []);

    let thrown = false;
    try {
      await client.sendAndConfirmTransaction(transaction, [wrong]);
    } catch(_err) {
      //"failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x1771"
      thrown = true;
    }
    expect(thrown).to.be.true;
  });

  it("Can register a player account with the correct parameters", async () => {
    let player1Username = "player1xx";
    let player1Pfp = Keypair.generate().publicKey;

    let { newPlayer: p1, transaction: t1 } = await client.initializePlayerAccount(user1.publicKey, player1Username, player1Pfp);
    await client.sendAndConfirmTransaction(t1, [user1]);
    let { transaction: t2 } = await client.initializePlayerAccount(user2.publicKey, "random", PublicKey.default);
    await client.sendAndConfirmTransaction(t2, [user2]);
    let { transaction: t3 } = await client.initializePlayerAccount(user3.publicKey, "xx", PublicKey.default);
    await client.sendAndConfirmTransaction(t3, [user3]);

    let playerAccount = await client.fetchPlayerAccount(p1);

    expect(playerAccount.user.toBase58()).to.equal(user1.publicKey.toBase58());
    expect(playerAccount.username).to.equal(player1Username);
    expect(playerAccount.nftMeta.toBase58()).to.equal(player1Pfp.toBase58());
  });

  it("Can add leaderboards to a game", async() => {
    let expectedDescription = "LeaderBoard1";
    let expectedNftMeta = Keypair.generate().publicKey;
    let scoresToRetain = 10;
    let scoresOrder = false; //descending order
    let decimals = 0;
    let minScore = new BN(0);
    let maxScore = new BN(100);
    let { newLeaderBoard, topEntries, transaction } = await gameClient.addLeaderBoard(
      auths[1].publicKey, 
      expectedDescription,
      expectedNftMeta,
      scoresToRetain,
      scoresOrder, 
      decimals,
      minScore,
      maxScore
    );
    await client.sendAndConfirmTransaction(transaction, [auths[1]]);
    leaderBoards.push(newLeaderBoard);

    let info = await gameClient.soar.fetchLeaderBoardAccount(newLeaderBoard);

    expect(info.description).to.equal(expectedDescription);
    expect(info.nftMeta.toBase58()).to.equal(expectedNftMeta.toBase58());
    expect(info.decimals).to.equal(0);
    expect(info.minScore.toNumber()).to.equal(minScore.toNumber());
    expect(info.maxScore.toNumber()).to.equal(maxScore.toNumber());
    expect(info.topEntries.toBase58()).to.equal(topEntries.toBase58());

    let entries = await gameClient.soar.fetchLeaderBoardTopEntriesAccount(topEntries);

    expect(entries.isAscending).to.be.false;
    expect(entries.topScores.length).to.equal(scoresToRetain);
    for (let score of entries.topScores) {
      expect(score.entry.score.toNumber()).to.equal(0);
      expect(score.entry.timestamp.toNumber()).to.equal(0);
      expect(score.user.toBase58()).to.equal(PublicKey.default.toBase58());
    }
  })
});