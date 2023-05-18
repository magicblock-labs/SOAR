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

  let mergeAccount = Keypair.generate();

  const PlayerConstants = {
    MAX_USERNAME_LEN: 100
  }
  const RewardConstants = {
    MAX_URI_LENGTH: 200,
    MAX_NAME_LENGTH: 32,
    MAX_SYMBOL_LENGTH: 10,
  }

  const MAXIMUM_TITLE_LENGTH = Number(client.program.idl.constants[0].value); 
  const MAXIMUM_DESCRIPTION_LENGTH = Number(client.program.idl.constants[1].value);

  it("Can register a game account with correct parameters", async () => {
    let title = "Game1";
    let description = "testDescription";
    let genre = Genre.Action;
    let gameType = GameType.Web; 
    let nftMeta = Keypair.generate().publicKey;
    let _auths = auths.map((keypair) => keypair.publicKey);

    let { gameAddress, transaction } = await client.initializeNewGame(game.publicKey, title, description, genre, gameType, nftMeta, _auths);
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

  it("Can't set fields with invalid lengths on a game", async() => {
    let title = "a".repeat(MAXIMUM_TITLE_LENGTH + 1);
    let description = "a".repeat(MAXIMUM_DESCRIPTION_LENGTH + 1);
    let newGame = Keypair.generate();

    let thrown = false;
    try {
      await client.sendAndConfirmTransaction(
        await client.initializeNewGame(newGame.publicKey, title, description, Genre.Action, GameType.Desktop,
          PublicKey.default, []).then((res) => res.transaction),
        [newGame]
      );
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;

    thrown = false;
    let newMeta = {
      title,
      description,
      genre: Genre.Action,
      gameType: GameType.Desktop,
      nftMeta: PublicKey.default,
    };

    try {
      await client.sendAndConfirmTransaction(
        await gameClient.update(auths[0].publicKey, newMeta, []).then((res) => res.transaction),
        [auths[0]]
      )
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;
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

    expect(info.id.toNumber()).to.equal(1);
    expect(info.game.toBase58()).to.equal(gameClient.address.toBase58());
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

    await gameClient.refresh();
    expect(gameClient.state.leaderboardCount.toNumber()).to.equal(1);
  });

  it("Can't add a leaderboard with the wrong authority", async() => {
    let dummyKeypair = Keypair.generate();
    let expectedFail = await gameClient.addLeaderBoard(dummyKeypair.publicKey, "", 
      PublicKey.default, 0, false, 0, new BN(0), new BN(1)).then((res) => res.transaction);

    let thrown = false;
    try {
      await gameClient.soar.sendAndConfirmTransaction(expectedFail, [dummyKeypair]);
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;

    await gameClient.refresh();
    expect(gameClient.state.leaderboardCount.toNumber()).to.equal(1);
  });

  it("Triggers default values when registering a leaderboard with unspecified params", async() => {
    let {transaction: tx, topEntries: te, newLeaderBoard: nl } = await gameClient.addLeaderBoard(auths[2].publicKey, "",
      PublicKey.default, 0, false, null, null, null);
    await gameClient.soar.sendAndConfirmTransaction(tx, [auths[2]]);

    let thrown = false;
    // Should not exist since no scores are being retained.
    try {
      await gameClient.soar.fetchLeaderBoardTopEntriesAccount(te);
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;

    let nlAccount = await gameClient.soar.fetchLeaderBoardAccount(nl);
    expect(nlAccount.decimals).to.equal(0);
    expect(nlAccount.minScore.toNumber()).to.equal(0);
    const maxBN = new BN(2).pow(new BN(64)).sub(new BN(1));
    expect(nlAccount.maxScore.eq(maxBN)).to.equal(true);
    leaderBoards.push(nl);

    await gameClient.refresh();
    expect(gameClient.state.leaderboardCount.toNumber()).to.equal(2);
  });

  it("Adds an achievement to the game", async() => {
    let title = "achievement1";
    let description = "";
    let nftMeta = PublicKey.default;
    let {transaction, newAchievement} = await gameClient.addAchievement(auths[0].publicKey, title, description, nftMeta);
    await client.sendAndConfirmTransaction(transaction, [auths[0]]);
    achievements[0] = newAchievement;

    let account = await gameClient.soar.fetchAchievementAccount(newAchievement);
    expect(account.title).to.equal(title);
    expect(account.description).to.equal(description);
    expect(account.nftMeta.toBase58()).to.equal(nftMeta.toBase58());
    expect(account.game.toBase58()).to.equal(gameClient.address.toBase58());
    expect(account.reward === null).to.be.true;

    await gameClient.refresh();
    expect(gameClient.state.achievementCount.toNumber()).to.equal(1);

    let thrown = false;
    let random = Keypair.generate();
    let { transaction: tx } = await gameClient.addAchievement(random.publicKey, "", "", PublicKey.default);
    try {
      await client.sendAndConfirmTransaction(tx, [random]);
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;

    thrown = false;
    try {
      await client.sendAndConfirmTransaction(
        await gameClient.addAchievement(auths[0].publicKey, "", "", PublicKey.default)
          .then((res) => res.transaction), []
      )
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;
  });

  it("Updates an achievement", async() => {
    let initialTitle = "ach2";
    let initialDescription = "achd2";
    let { newAchievement, transaction } = await gameClient.addAchievement(auths[1].publicKey, initialTitle, initialDescription, PublicKey.default);
    await client.sendAndConfirmTransaction(transaction, [auths[1]]);
    achievements[1] = newAchievement;

    await gameClient.refresh();
    expect(gameClient.state.achievementCount.toNumber()).to.equal(2);

    let updatedDescription = "desc2Updated";
    let updatedNftMeta = Keypair.generate().publicKey;
    let { transaction: tx } = await gameClient.updateAchievement(auths[0].publicKey, newAchievement, null, updatedDescription, updatedNftMeta);
    await client.sendAndConfirmTransaction(tx, [auths[0]]);

    let account = await gameClient.soar.fetchAchievementAccount(newAchievement);
    expect(account.title).to.equal(initialTitle);
    expect(account.description).to.equal(updatedDescription);
    expect(account.nftMeta.toBase58()).to.equal(updatedNftMeta.toBase58());

    let thrown = false;
    let random = Keypair.generate();
    let { transaction: failTx } = await gameClient.updateAchievement(random.publicKey, newAchievement, "", "", PublicKey.default);
    try {
      await client.sendAndConfirmTransaction(failTx, [random]);
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;
  });

  it("Adds a reward for an achievement", async() => {
    let uri = "x".repeat(RewardConstants.MAX_URI_LENGTH + 1);
    let name = "x".repeat(RewardConstants.MAX_NAME_LENGTH + 1);
    let symbol = "x".repeat(RewardConstants.MAX_SYMBOL_LENGTH + 1);
    let {transaction: failTx } = await gameClient.soar.addRewardForAchievement(auths[0].publicKey, achievements[0],
      gameClient.address, uri, name, symbol, null);

    let thrown = false;
    try {
      await client.sendAndConfirmTransaction(failTx, [auths[0]]);
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;

    uri = uri.substring(0, RewardConstants.MAX_URI_LENGTH);
    name = name.substring(0, RewardConstants.MAX_NAME_LENGTH);
    symbol = symbol.substring(0, RewardConstants.MAX_SYMBOL_LENGTH);

    let {newReward, transaction} = await gameClient.soar.addRewardForAchievement(auths[0].publicKey, achievements[0],
      gameClient.address, uri, name, symbol, null);

    await client.sendAndConfirmTransaction(transaction, [auths[0]]);
    let account = await gameClient.soar.fetchRewardAccount(newReward);

    expect(account.achievement.toBase58()).to.equal(achievements[0].toBase58());
    expect(account.uri).to.equal(uri);
    expect(account.name).to.equal(name);
    expect(account.symbol).to.equal(symbol);
    expect(account.minted.toNumber()).to.equal(0);
    expect(account.collectionMint).to.be.null;
  });

  it("Can register a player to a leaderboard", async() => {
    let { transaction, newList } = await client.registerPlayerEntryForLeaderBoard(user1.publicKey, leaderBoards[0],
      gameClient.address);
    await client.sendAndConfirmTransaction(transaction, [user1]);

    let account = await client.fetchPlayerEntryListAccount(newList);
    expect(account.playerInfo.toBase58()).to.equal(client.derivePlayerAddress(user1.publicKey)[0].toBase58());
    expect(account.leaderboard.toBase58()).to.equal(leaderBoards[0].toBase58());
    expect(account.scores.length).to.equal(0);
  });

  it("Can submit a player score", async() => {
    let score = new BN(1);
    let { transaction } = await client.submitScoreToLeaderBoard(user1.publicKey, auths[0].publicKey, gameClient.address,
      leaderBoards[0], score);
    await client.sendAndConfirmTransaction(transaction, [auths[0], user1]); 

    let account = await client.fetchPlayerEntryListAccount(client.derivePlayerEntryListAddress(user1.publicKey, leaderBoards[0])[0]);
    expect(account.scores.length).to.equal(1);
    expect(account.scores[0].score.toNumber()).to.equal(score.toNumber());
    expect(account.allocCount).to.equal(10);
  });

  it("Can resize if needed when submitting a player score", async() => {
    const entryList = client.derivePlayerEntryListAddress(user1.publicKey, leaderBoards[0])[0];
    let initialLength = 8 + 32 + 32 + 2 + 4 + (10 * (8 + 8)); // initial space allocated for 10 scores.
    let info = await client.provider.connection.getAccountInfo(entryList);
    expect(info.data.length).to.equal(initialLength);

    let i = 2;
    while (i <= 10) {
      let score = new BN(i);
      let { transaction } = await client.submitScoreToLeaderBoard(user1.publicKey, auths[0].publicKey, gameClient.address,
        leaderBoards[0], score);
      await client.sendAndConfirmTransaction(transaction, [auths[0], user1]);
      ++i;
    }

    let list = await client.fetchPlayerEntryListAccount(entryList);
    info = await client.provider.connection.getAccountInfo(entryList);
    expect(list.allocCount).to.equal(10);
    expect(info.data.length).to.equal(initialLength);

    let { transaction } = await client.submitScoreToLeaderBoard(user1.publicKey, auths[0].publicKey, gameClient.address,
      leaderBoards[0], new BN(11));
    await client.sendAndConfirmTransaction(transaction, [auths[0], user1]);

    list = await client.fetchPlayerEntryListAccount(entryList);
    info = await client.provider.connection.getAccountInfo(entryList);

    expect(list.allocCount).to.equal(20);
    expect(list.scores.length).to.equal(11);
    expect(info.data.length).to.equal(initialLength + (10 * (8 + 8)));
  });

  it("Should fail submitting a player score", async() => {
    // -> Fail because player isn't registered to leaderboard.
    let thrown = false;
    try {
      let { transaction } = await client.submitScoreToLeaderBoard(user2.publicKey, auths[0].publicKey, gameClient.address,
        leaderBoards[0], new BN(20));
      await client.sendAndConfirmTransaction(transaction, [auths[0], user2]);
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;

    // -> Fail because authority not present.
    thrown = false;
    try {
      let { transaction } = await client.submitScoreToLeaderBoard(user1.publicKey, auths[0].publicKey, gameClient.address,
        leaderBoards[0], new BN(20));
      await client.sendAndConfirmTransaction(transaction, [user1]);
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;

    // Fail because wrong authority.
    let random = Keypair.generate();
    thrown = false;
    try {
      let { transaction } = await client.submitScoreToLeaderBoard(user1.publicKey, random.publicKey, gameClient.address,
        leaderBoards[0], new BN(20));
      await client.sendAndConfirmTransaction(transaction, [random, user1]);
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;

    // -> Fail because scores not within bounds.
    thrown = false;
    try {
      let { transaction } = await client.submitScoreToLeaderBoard(user1.publicKey, auths[0].publicKey, gameClient.address,
        leaderBoards[0], new BN(101));
      await client.sendAndConfirmTransaction(transaction, [auths[0], user1]);
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;
  });

  it("Can store top entries for a leaderboard", async() => {});

  it("Can unlock an achievement for a player", async() => {
    // Unlock achievements[0] for player. LeaderBoards[0] is the leaderboard the user is registered to.
    let { newPlayerAchievement, transaction } = await client.unlockPlayerAchievement(user1.publicKey, auths[0].publicKey, achievements[0], gameClient.address,
      leaderBoards[0]);
    try {await client.sendAndConfirmTransaction(transaction, [auths[0], user1]);} catch(err) {console.log(err);}

    let account = await client.fetchPlayerAchievementAccount(newPlayerAchievement);
    expect(account.player.toBase58()).to.equal(client.derivePlayerAddress(user1.publicKey)[0].toBase58());
    expect(account.achievement.toBase58()).to.equal(achievements[0].toBase58());
    expect(account.unlocked).to.be.true;
    expect(account.metadata).to.be.null;
  });

  it("Can initiate a merge", async() => {
    let keys = [user2.publicKey, user3.publicKey, user2.publicKey, user1.publicKey, user3.publicKey]
      .map((key) => client.derivePlayerAddress(key)[0]);
    
    let { newMergeAccount, transaction } = await client.initiateMerge(user1.publicKey, mergeAccount.publicKey, keys);
    try {await client.sendAndConfirmTransaction(transaction, [mergeAccount, user1])}catch(err){console.log(err);};

    let account = await client.fetchMergedAccount(newMergeAccount);
    expect(account.initiator.toBase58()).to.equal(user1.publicKey.toBase58());
    expect(account.others.length).to.equal(2);
    expect(account.others[0].approved).to.be.false;
    expect(account.others[1].approved).to.be.false;
    expect(account.mergeComplete).to.be.false;

    let mapped = account.others.map((res) => res.key.toBase58());
    expect(mapped).to.contain(client.derivePlayerAddress(user3.publicKey)[0].toBase58());
    expect(mapped).to.contain(client.derivePlayerAddress(user2.publicKey)[0].toBase58());
  });

  it("Can approve a merge", async() => {
    let {transaction:tx1} = await client.registerMergeApproval(user2.publicKey, mergeAccount.publicKey);
    let {transaction:tx2} = await client.registerMergeApproval(user3.publicKey, mergeAccount.publicKey);
    
    let thrown = false;
    try { 
      await client.sendAndConfirmTransaction(tx1, []) 
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;

    await client.sendAndConfirmTransaction(tx1, [user2]);
    await client.sendAndConfirmTransaction(tx2, [user3]);

    let infos = await client.fetchMergedAccount(mergeAccount.publicKey).then((res) => res.others);
    expect(infos[0].approved).to.be.true;
    expect(infos[1].approved).to.be.true;
  });

  it("Can mint a reward to a player for unlocking an achievement", async() => {});
});