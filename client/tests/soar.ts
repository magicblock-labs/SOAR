import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";
import { PublicKey, Keypair } from "@solana/web3.js";
import { SoarProgram, GameClient, GameType, Genre } from "../sdk/src";
import BN from "bn.js";
import * as utils from "./utils";

describe("soar", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const client = SoarProgram.get(provider);

  let gameClient: GameClient;
  let game = Keypair.generate();
  let auths = [Keypair.generate(), Keypair.generate()];
  let leaderBoards: PublicKey[] = [];
  let achievements: PublicKey[] = [];

  let user1 = Keypair.generate();
  let user2 = Keypair.generate();
  let user3 = Keypair.generate();

  let user1ClaimedMints: PublicKey[] = [];
  let user3NftMint: PublicKey;

  let mergeAccount = Keypair.generate();

  const RewardConstants = {
    MAX_URI_LENGTH: 200,
    MAX_NAME_LENGTH: 32,
    MAX_SYMBOL_LENGTH: 10,
  }

  const MAXIMUM_TITLE_LENGTH = Number(client.program.idl.constants[0].value); 
  const MAXIMUM_DESCRIPTION_LENGTH = Number(client.program.idl.constants[1].value);

  let ftRewardMint: PublicKey;

  it("Can register a game account with correct parameters", async () => {
    let title = "Game1";
    let description = "testDescription";
    let genre = Genre.Action;
    let gameType = GameType.Web; 
    let nftMeta = Keypair.generate().publicKey;
    let _auths = auths.map((keypair) => keypair.publicKey);

    let { newGame, transaction } = await client.initializeNewGame(game.publicKey, title, description, genre, gameType, nftMeta, _auths);
    await client.sendAndConfirmTransaction(transaction, [game]);

    let info = await client.fetchGameAccount(newGame);

    expect(info.meta.title).to.equal(title);
    expect(info.meta.description).to.equal(description);
    expect(info.meta.genre).to.equal(genre);
    expect(info.meta.gameType).to.equal(gameType);
    expect(info.meta.nftMeta.toBase58()).to.equal(nftMeta.toBase58());
    expect(info.leaderboardCount.toNumber()).to.equal(0);

    expect(info.auth.length).to.equal(2);
    expect(info.auth[0].toBase58()).to.equal(auths[0].publicKey.toBase58());
    expect(info.auth[1].toBase58()).to.equal(auths[1].publicKey.toBase58());

    gameClient = new GameClient(client, newGame);
  });

  it("Can update a game with the correct parameters", async() => {
    let newAuths = [Keypair.generate(), Keypair.generate(), Keypair.generate()];
    let { transaction }  = await gameClient.update(auths[0].publicKey, null, 
      newAuths.map((auth) => auth.publicKey));
    await client.sendAndConfirmTransaction(transaction, [auths[0]]);
    auths = newAuths;

    await gameClient.refresh();
    let authKeys = gameClient.account.auth;
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

    let newMeta = {
      title,
      description,
      genre: Genre.Action,
      gameType: GameType.Desktop,
      nftMeta: PublicKey.default,
    };
    thrown = false;
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

    let { newPlayer: p1, transaction: transaction1 } = await client.initializePlayerAccount(user1.publicKey, player1Username, player1Pfp);
    await client.sendAndConfirmTransaction(transaction1, [user1]);
    let { transaction: transaction2 } = await client.initializePlayerAccount(user2.publicKey, "random", PublicKey.default);
    await client.sendAndConfirmTransaction(transaction2, [user2]);
    let { transaction: transaction3 } = await client.initializePlayerAccount(user3.publicKey, "xx", PublicKey.default);
    await client.sendAndConfirmTransaction(transaction3, [user3]);

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

    let info = await gameClient.program.fetchLeaderBoardAccount(newLeaderBoard);

    expect(info.id.toNumber()).to.equal(1);
    expect(info.game.toBase58()).to.equal(gameClient.address.toBase58());
    expect(info.description).to.equal(expectedDescription);
    expect(info.nftMeta.toBase58()).to.equal(expectedNftMeta.toBase58());
    expect(info.decimals).to.equal(0);
    expect(info.minScore.toNumber()).to.equal(minScore.toNumber());
    expect(info.maxScore.toNumber()).to.equal(maxScore.toNumber());
    expect(info.topEntries.toBase58()).to.equal(topEntries.toBase58());

    let entries = await gameClient.program.fetchLeaderBoardTopEntriesAccount(topEntries);

    expect(entries.isAscending).to.be.false;
    expect(entries.topScores.length).to.equal(scoresToRetain);
    for (let score of entries.topScores) {
      expect(score.entry.score.toNumber()).to.equal(0);
      expect(score.entry.timestamp.toNumber()).to.equal(0);
      expect(score.player.toBase58()).to.equal(PublicKey.default.toBase58());
    }

    await gameClient.refresh();
    expect(gameClient.account.leaderboardCount.toNumber()).to.equal(1);
  });

  it("Can update a leaderboard", async() => {
    let leaderboard = leaderBoards[0];
    let newDescription = "newDescription";
    let newMeta = Keypair.generate().publicKey;

    let { transaction } = await client.updateGameLeaderboard(auths[0].publicKey, leaderboard, 
      newDescription, newMeta);
    await client.sendAndConfirmTransaction(transaction, [auths[0]]);

    let info = await client.fetchLeaderBoardAccount(leaderboard);
    expect(info.description).to.equal(newDescription);
    expect(info.nftMeta.toBase58()).to.equal(newMeta.toBase58());
  });

  it("Can't add a leaderboard with the wrong authority", async() => {
    let dummyKeypair = Keypair.generate();
    let expectedFail = await gameClient.addLeaderBoard(dummyKeypair.publicKey, "", 
      PublicKey.default, 0, false, 0, new BN(0), new BN(1)).then((res) => res.transaction);

    let thrown = false;
    try {
      await gameClient.program.sendAndConfirmTransaction(expectedFail, [dummyKeypair]);
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;

    await gameClient.refresh();
    expect(gameClient.account.leaderboardCount.toNumber()).to.equal(1);
  });

  it("Triggers default values when registering a leaderboard with unspecified params", async() => {
    let {transaction: tx, topEntries: te, newLeaderBoard: nl } = await gameClient.addLeaderBoard(auths[2].publicKey, "",
      PublicKey.default, 0, false, null, null, null);
    await gameClient.program.sendAndConfirmTransaction(tx, [auths[2]]);

    let thrown = false;
    // Should not exist since no scores are being retained.
    try {
      await gameClient.program.fetchLeaderBoardTopEntriesAccount(te);
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;

    let nlAccount = await gameClient.program.fetchLeaderBoardAccount(nl);
    expect(nlAccount.decimals).to.equal(0);
    expect(nlAccount.minScore.toNumber()).to.equal(0);
    const maxBN = new BN(2).pow(new BN(64)).sub(new BN(1));
    expect(nlAccount.maxScore.eq(maxBN)).to.equal(true);
    leaderBoards.push(nl);

    await gameClient.refresh();
    expect(gameClient.account.leaderboardCount.toNumber()).to.equal(2);
  });

  it("Adds an achievement to the game", async() => {
    let title = "achievement1";
    let description = "";
    let nftMeta = PublicKey.default;
    let {transaction, newAchievement} = await gameClient.addAchievement(auths[0].publicKey, title, description, nftMeta);
    await client.sendAndConfirmTransaction(transaction, [auths[0]]);
    achievements[0] = newAchievement;

    let account = await gameClient.program.fetchAchievementAccount(newAchievement);
    expect(account.title).to.equal(title);
    expect(account.description).to.equal(description);
    expect(account.nftMeta.toBase58()).to.equal(nftMeta.toBase58());
    expect(account.game.toBase58()).to.equal(gameClient.address.toBase58());
    expect(account.reward === null).to.be.true;

    await gameClient.refresh();
    expect(gameClient.account.achievementCount.toNumber()).to.equal(1);

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
    expect(gameClient.account.achievementCount.toNumber()).to.equal(2);

    let updatedDescription = "desc2Updated";
    let updatedNftMeta = Keypair.generate().publicKey;
    let { transaction: tx } = await gameClient.updateAchievement(auths[0].publicKey, newAchievement, null, updatedDescription, updatedNftMeta);
    await client.sendAndConfirmTransaction(tx, [auths[0]]);

    let account = await gameClient.program.fetchAchievementAccount(newAchievement);
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

  it("Adds an nft reward for an achievement", async() => {
    let uri = "x".repeat(RewardConstants.MAX_URI_LENGTH + 1);
    let name = "x".repeat(RewardConstants.MAX_NAME_LENGTH + 1);
    let symbol = "x".repeat(RewardConstants.MAX_SYMBOL_LENGTH + 1);
    let availableRewards = new BN(500);

    let newReward = Keypair.generate();
    let { transaction: failTx } = await client.addNonFungibleReward(auths[0].publicKey, newReward.publicKey, 
      achievements[0], availableRewards, uri, name, symbol);

    // Should fail because uri, name, symbol too long.
    let thrown = false;
    try {
      await client.sendAndConfirmTransaction(failTx, [auths[0], newReward]);
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;

    uri = uri.substring(0, RewardConstants.MAX_URI_LENGTH);
    name = name.substring(0, RewardConstants.MAX_NAME_LENGTH);
    symbol = symbol.substring(0, RewardConstants.MAX_SYMBOL_LENGTH);

    let { transaction } = await client.addNonFungibleReward(auths[0].publicKey, newReward.publicKey, 
      achievements[0], availableRewards, uri, name, symbol);

    await client.sendAndConfirmTransaction(transaction, [auths[0], newReward]); 
    let account = await gameClient.program.fetchRewardAccount(newReward.publicKey);

    expect(account.achievement.toBase58()).to.equal(achievements[0].toBase58());
    expect(account.availableSpots.toNumber()).to.equal(availableRewards.toNumber());
    expect(account.FungibleToken).to.be.undefined;
    expect(account.NonFungibleToken).to.not.be.undefined;
    expect(account.NonFungibleToken.uri).to.equal(uri);
    expect(account.NonFungibleToken.symbol).to.equal(symbol);
    expect(account.NonFungibleToken.minted.toNumber()).to.equal(0);
    expect(account.NonFungibleToken.collection).to.be.null;
  });

  it("Can add a ft reward for an achievement", async() => {
    const amountPerUser = new BN(1);
    const availableRewards = new BN(2);

    let { mint, authority } = await utils.initializeTestMint(client);
    ftRewardMint = mint;

    const tokenAccountOwner = Keypair.generate();
    const tokenAccount = await utils.createTokenAccount(client, tokenAccountOwner.publicKey, mint);
    await utils.mintToAccount(client, mint, authority, tokenAccount, 5);

    const newReward = Keypair.generate();
    let { transaction } = await client.addFungibleReward(auths[0].publicKey, newReward.publicKey, achievements[1],
      amountPerUser, availableRewards, new BN(2), mint, tokenAccount, tokenAccountOwner.publicKey);
    await client.sendAndConfirmTransaction(transaction, [auths[0], tokenAccountOwner, newReward]);
    let account = await client.fetchRewardAccount(newReward.publicKey);

    expect(account.achievement.toBase58()).to.equal(achievements[1].toBase58());
    expect(account.availableSpots.toNumber()).to.equal(availableRewards.toNumber());
    expect(account.NonFungibleToken).to.be.undefined;
    expect(account.FungibleToken).to.not.be.undefined;

    expect(account.FungibleToken.mint.toBase58()).to.equal(mint.toBase58());
    expect(account.FungibleToken.account.toBase58()).to.equal(tokenAccount.toBase58());
    expect(account.FungibleToken.amount.toNumber()).to.equal(amountPerUser.toNumber());
  });

  it("Can register a player to a leaderboard", async() => {
    let { transaction, newList } = await client.registerPlayerEntryForLeaderBoard(user1.publicKey, leaderBoards[0]);
    await client.sendAndConfirmTransaction(transaction, [user1]);

    let account = await client.fetchPlayerScoresListAccount(newList);
    expect(account.playerAccount.toBase58()).to.equal(client.utils.derivePlayerAddress(user1.publicKey)[0].toBase58());
    expect(account.leaderboard.toBase58()).to.equal(leaderBoards[0].toBase58());
    expect(account.scores.length).to.equal(0);
  });

  it("Can submit a player score", async() => {
    let score = new BN(1);
    let { transaction } = await client.submitScoreToLeaderBoard(user1.publicKey, auths[0].publicKey,
      leaderBoards[0], score);
    await client.sendAndConfirmTransaction(transaction, [auths[0]]); 

    let account = await client.fetchPlayerScoresListAccount(client.utils.derivePlayerScoresListAddress(user1.publicKey, leaderBoards[0])[0]);
    expect(account.scores.length).to.equal(1);
    expect(account.scores[0].score.toNumber()).to.equal(score.toNumber());
    expect(account.allocCount).to.equal(10);

    let topEntries = await client.fetchLeaderBoardTopEntriesAccount(client.utils.deriveLeaderTopEntriesAddress(leaderBoards[0])[0]);
    let scores = topEntries.topScores.map((score) => score.entry.score.toNumber());
    let expectedScores = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    expect(JSON.stringify(scores)).to.equal(JSON.stringify(expectedScores));
  });

  it("Can resize if needed when submitting a player score", async() => {
    const entryList = client.utils.derivePlayerScoresListAddress(user1.publicKey, leaderBoards[0])[0];
    let initialLength = 8 + 32 + 32 + 2 + 4 + (10 * (8 + 8)); // initial space allocated for 10 scores.
    let info = await client.provider.connection.getAccountInfo(entryList);
    expect(info.data.length).to.equal(initialLength);

    let i = 2;
    while (i <= 10) {
      let score = new BN(i);
      let { transaction } = await client.submitScoreToLeaderBoard(user1.publicKey, auths[0].publicKey,
        leaderBoards[0], score);
      await client.sendAndConfirmTransaction(transaction, [auths[0]]);
      ++i;
    }

    let list = await client.fetchPlayerScoresListAccount(entryList);
    info = await client.provider.connection.getAccountInfo(entryList);
    expect(list.allocCount).to.equal(10);
    expect(info.data.length).to.equal(initialLength);

    let { transaction } = await client.submitScoreToLeaderBoard(user1.publicKey, auths[0].publicKey,
      leaderBoards[0], new BN(11));
    await client.sendAndConfirmTransaction(transaction, [auths[0]]);

    list = await client.fetchPlayerScoresListAccount(entryList);
    info = await client.provider.connection.getAccountInfo(entryList);

    expect(list.allocCount).to.equal(20);
    expect(list.scores.length).to.equal(11);
    expect(info.data.length).to.equal(initialLength + (10 * (8 + 8)));
  });

  it("Can store top entries for a leaderboard", async() => {
    let topEntries = client.utils.deriveLeaderTopEntriesAddress(leaderBoards[0])[0];
    let info = await client.fetchLeaderBoardTopEntriesAccount(topEntries);

    let scores = info.topScores.map((score) => score.entry.score.toNumber());
    let expectedScores = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    expect(scores.length).to.equal(expectedScores.length); 
    expect(JSON.stringify(scores), JSON.stringify(expectedScores));
  });

  it("Should fail submitting a player score", async() => {
    // -> Fail because player isn't registered to leaderboard.
    let thrown = false;
    try {
      let { transaction } = await client.submitScoreToLeaderBoard(user2.publicKey, auths[0].publicKey,
        leaderBoards[0], new BN(20));
      await client.sendAndConfirmTransaction(transaction, [auths[0]]);
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;

    // -> Fail because authority not present.
    thrown = false;
    try {
      let { transaction } = await client.submitScoreToLeaderBoard(user1.publicKey, auths[0].publicKey,
        leaderBoards[0], new BN(20));
      await client.sendAndConfirmTransaction(transaction, []);
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;

    // Fail because wrong authority.
    let random = Keypair.generate();
    thrown = false;
    try {
      let { transaction } = await client.submitScoreToLeaderBoard(user1.publicKey, random.publicKey,
        leaderBoards[0], new BN(20));
      await client.sendAndConfirmTransaction(transaction, [random]);
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;

    // -> Fail because scores not within bounds.
    thrown = false;
    try {
      let { transaction } = await client.submitScoreToLeaderBoard(user1.publicKey, auths[0].publicKey,
        leaderBoards[0], new BN(101));
      await client.sendAndConfirmTransaction(transaction, [auths[0]]);
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;
  });

  it("Can unlock an achievement for a player", async() => {
    // Unlock achievements[0] for player. LeaderBoards[0] is the leaderboard the user is registered to.
    let { newPlayerAchievement, transaction } = await client.unlockPlayerAchievement(user1.publicKey, auths[0].publicKey, achievements[0],
      leaderBoards[0], gameClient.address);
    await client.sendAndConfirmTransaction(transaction, [auths[0]]);

    let account = await client.fetchPlayerAchievementAccount(newPlayerAchievement);
    expect(account.player.toBase58()).to.equal(client.utils.derivePlayerAddress(user1.publicKey)[0].toBase58());
    expect(account.achievement.toBase58()).to.equal(achievements[0].toBase58());
    expect(account.unlocked).to.be.true;
  });

  it("Can initiate a merge", async() => {
    let keys = [user2.publicKey, user3.publicKey, user2.publicKey, user1.publicKey, user3.publicKey]
      .map((key) => client.utils.derivePlayerAddress(key)[0]);
    
    let { newMerge, transaction } = await client.initiateMerge(user1.publicKey, mergeAccount.publicKey, keys);
    await client.sendAndConfirmTransaction(transaction, [mergeAccount, user1]);

    let account = await client.fetchMergedAccount(newMerge);
    expect(account.initiator.toBase58()).to.equal(user1.publicKey.toBase58());
    expect(account.approvals.length).to.equal(2);
    expect(account.approvals[0].approved).to.be.false;
    expect(account.approvals[1].approved).to.be.false;
    expect(account.mergeComplete).to.be.false;

    let mapped = account.approvals.map((res) => res.key.toBase58());
    expect(mapped).to.contain(client.utils.derivePlayerAddress(user3.publicKey)[0].toBase58());
    expect(mapped).to.contain(client.utils.derivePlayerAddress(user2.publicKey)[0].toBase58());
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

    let approvals = await client.fetchMergedAccount(mergeAccount.publicKey).then((res) => res.approvals);
    expect(approvals[0].approved).to.be.true;
    expect(approvals[1].approved).to.be.true;
  });

  it("Can overwrite the current reward for an achievement and add a collection", async() => {
    const uri = utils.TEST1_URI;
    const name = "test_name_1";
    const symbol = "t1";
    const availableRewards = new BN(10);
    const newReward = Keypair.generate();

    let metaplex = utils.initMetaplex(client.provider.connection);
    let collectionMint = await utils.initTestCollectionNft(metaplex, utils.COLLECTION_URI, "collection");

    // Overwrite achievement[0]'s reward.
    let { transaction } = await client.addNonFungibleReward(auths[0].publicKey, newReward.publicKey, 
      achievements[0], availableRewards, uri, name, symbol, collectionMint.publicKey, 
      client.provider.publicKey);

    await client.sendAndConfirmTransaction(transaction, [auths[0], newReward]);
    let account = await gameClient.program.fetchRewardAccount(newReward.publicKey);

    expect(account.achievement.toBase58()).to.equal(achievements[0].toBase58());
    expect(account.availableSpots.toNumber()).to.equal(availableRewards.toNumber());
    expect(account.FungibleToken).to.be.undefined;
    expect(account.NonFungibleToken).to.not.be.undefined;
    expect(account.NonFungibleToken.uri).to.equal(uri);
    expect(account.NonFungibleToken.symbol).to.equal(symbol);
    expect(account.NonFungibleToken.minted.toNumber()).to.equal(0);
    expect(account.NonFungibleToken.collection).to.not.be.null;
    expect(account.NonFungibleToken.collection.toBase58()).to.equal(collectionMint.publicKey.toBase58());
  });

  it("Can claim nft rewards for unlocking an achievement", async() => {
    let mint = Keypair.generate();
    let { transaction } = await client.claimNftReward(auths[0].publicKey, achievements[0], mint.publicKey, user1.publicKey);
    let thrown = false;
    // Should fail because `unlock_player_achievement` has already been called for this player
    try {
      await client.sendAndConfirmTransaction(transaction, [mint, auths[0]]);
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;
    
    // Claim an nft reward(and unlock a player achievement account).
    mint = Keypair.generate();
    let { transaction: tx } = await client.claimNftReward(auths[0].publicKey, achievements[0], mint.publicKey, user3.publicKey);
    await client.sendAndConfirmTransaction(tx, [mint, auths[0]]);
    user3NftMint = mint.publicKey;

    let userWallet = client.utils.deriveAssociatedTokenAddress(mint.publicKey, user3.publicKey);
    let balance = await client.provider.connection.getTokenAccountBalance(userWallet);
    expect(balance.value.uiAmount).to.equal(1);

    let metadata = await utils.fetchMetadataAccount(client, mint.publicKey);
    expect(metadata.mint.toBase58()).to.equal(mint.publicKey.toBase58());
    expect(metadata.updateAuthority.toBase58()).to.equal(achievements[0].toBase58());
    expect(metadata.collection.verified).to.equal(false);

    let rewardAddress = await client.fetchAchievementAccount(achievements[0]).then((res) => res.reward);
    let reward = await client.fetchRewardAccount(rewardAddress);
    expect(metadata.collection.key.toBase58()).to.equal(reward.NonFungibleToken.collection.toBase58());
    expect(reward.NonFungibleToken.minted.toNumber()).to.equal(1);
    
    let playerAchievement = client.utils.derivePlayerAchievementAddress(user3.publicKey, achievements[0])[0];
    let account = await client.fetchPlayerAchievementAccount(playerAchievement);
    expect(account.claimed).to.be.true;

    
    // Should fail because reward already claimed.
    mint = Keypair.generate();
    thrown = false;
    let { transaction: shouldFail } = await client.claimNftReward(auths[0].publicKey, achievements[0], mint.publicKey, user3.publicKey);
    try {
      await client.sendAndConfirmTransaction(shouldFail, [mint, auths[0]]);
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;
  });

  it("Can verify a claimed nft reward", async() => {
    let mint = user3NftMint;
    let { transaction } = await client.verifyPlayerNftReward(user3.publicKey, achievements[0], mint);
    try {
      await client.sendAndConfirmTransaction(transaction, [user3]);
    } catch(err) {
      console.log(err);
    }

    let metadata = await utils.fetchMetadataAccount(client, mint);
    expect(metadata.mint.toBase58()).to.equal(mint.toBase58());
    expect(metadata.collection.verified).to.equal(true);

    // Should fail if it's not a valid mint.
    mint = Keypair.generate().publicKey;
    let thrown = false;
    try {
      let { transaction } = await client.verifyPlayerNftReward(user3.publicKey, achievements[0], mint);
      await client.sendAndConfirmTransaction(transaction, [user3]);
    } catch(err) {
      thrown = true;
    }
    expect(thrown).to.be.true;
  });

  it("Can claim a ft reward for unlocking an achievement", async() => {
    let wallet = client.utils.deriveAssociatedTokenAddress(ftRewardMint, user1.publicKey);
    let tokenAccount = await client.provider.connection.getAccountInfo(wallet);
    if (tokenAccount !== null) {
      let balance = await client.provider.connection.getTokenAccountBalance(wallet);
      expect(balance.value.uiAmount).to.equal(0);
    }

    let { transaction } = await client.claimFtReward(auths[0].publicKey, achievements[1], user1.publicKey);
    await client.sendAndConfirmTransaction(transaction, [auths[0]]);

    let balance = await client.provider.connection.getTokenAccountBalance(wallet);
    expect(balance.value.uiAmount).to.equal(1);

    let account = await client.fetchPlayerAchievementAccount(client.utils.derivePlayerAchievementAddress(user1.publicKey, achievements[1])[0]);
    expect(account.claimed).to.be.true; 
  });
});