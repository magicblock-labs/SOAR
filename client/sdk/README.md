# SOAR SDK

This Typescript sdk provides a convenient interface and methods for interacting with the on-chain soar program.

## Contents

- [SOAR SDK](#soar-sdk)
  - [Contents](#contents)
  - [Getting started](#getting-started)
  - [Classes](#classes)
    - [SoarProgram](#soarprogram)
    - [GameClient](#gameclient)
    - [InstructionBuilder](#instructionbuilder)
  - [Contributing](#contributing)
    - [Tests](#tests)

## Getting started

### Create a new game

```typescript
import { SoarProgram, GameType, Genre } from "@magicblock-labs/soar-sdk";

// Create a Soar client using the '@solana/web3.js' active Connection and a defaultPayer
const client = SoarProgram.getFromConnection(connection, defaultPayer); 

let game = Keypair.generate();
let title = "Game1";
let description = "Description";
let genre = Genre.Action;
let gameType = GameType.Web; 
let nftMeta = Keypair.generate().publicKey;
let _auths = auths.map((keypair) => keypair.publicKey);

// Retrieve the bundled transaction.
let { newGame, transaction } = await client.initializeNewGame(game.publicKey, title, description, genre, gameType, nftMeta, _auths);
// Send and confirm the transaction with the game keypair as signer. 
await web3.sendAndConfirmTransaction(connection, transaction);
```

### Create a leaderboard

```typescript
const transactionIx = await client.addNewGameLeaderBoard(
    newGame,
    authWallet.publicKey,
    "my leaderboard", // description
    leaderboardNft, // nft associated with the leaderboard
    100,
    true // isAscending
);

await web3.sendAndConfirmTransaction(connection, transactionIx.transaction, [authWallet]);
```typescript

### Submit a score

```typescript
const score = 10;
const playerAddress = new web3.PublicKey("..."); // The player publicKey
const authWallet = web3.Keypair.fromSecretKey(bs58.decode("")); // AUTH_WALLET_PRIVATE_KEY
const leaderboardPda = new web3.PublicKey(""); // LEADERBOARD_PDA

const transactionIx = await client.submitScoreToLeaderBoard(
    playerAddress,
    authWallet.publicKey,
    leaderboardPda,
    new BN(score)
);

await web3.sendAndConfirmTransaction(connection, transactionIx.transaction, [authWallet]);
```typescript

## Classes

### SoarProgram

The `SoarProgram` class gives client access to every instruction in the on-chain SOAR program.

It also gives utility functions for deriving PDAs:

```typescript
const user = Keypair.generate().publicKey;
const playerAddress = client.utils.derivePlayerAddress(user)[0],
```

fetching an account:

```typescript
const account = await client.fetchLeaderBoardAccount(address);
```

and fetching multiple accounts:

```typescript
const accounts = await client.fetchAllLeaderboardAccounts([]);
```

### GameClient

The `GameClient` provides a more specific set of functions tailored to a single Game account.

```typescript
import { GameClient } from "@magicblock-labs/soar-sdk";
```

Get an instance representing an existing on-chain Game account:

```typescript
const soar = SoarProgram.getFromConnection(connection, defaultPayer);
const gameClient = new GameClient(soar, address);
```

Register a new game:

```typescript
const soar = SoarProgram.getFromConnection(connection, defaultPayer);
const game = new GameClient.register(soar, ...);
```

```typescript
// Create a new leaderboard:
await game.addLeaderboard(....);

// Access the game's state.
await game.init();

// Refresh the game's state.
await game.refresh();

// Get the most recently-created achievement for a game
const achievement = game.recentAchievementAddress();
```

## InstructionBuilder

```typescript
import { InstructionBuilder } from "@magicblock-labs/soar-sdk"
```

The InstructionBuilder provides a set of methods for conveniently bundling transactions.

```typescript
const transaction = await this.builder
      .andInitializePlayer({username, nftMeta}, user)
      .andRegisterPlayerEntry(/*...*/)
      .andSubmitScoreToLeaderboard(/*...*/)
      .and(/*some other transaction*/)
      .then((builder) => builder.build());
```

### Tests.

Test files are located in `client/tests/*`. To run the tests, enter `anchor test` from the root directory of the repository.
