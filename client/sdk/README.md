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

```typescript
import { SoarProgram, GameType, Genre } from "@magicblock-labs/soar-sdk";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const client = SoarProgram.get(provider);

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
await client.sendAndConfirmTransaction(transaction, [game]);
```

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
import { GameClient } from "@soar/sdk";
```

Get an instance representing an existing on-chain Game account:

```typescript
const soar = SoarProgram.get(provider);
const gameClient = new GameClient(soar, address);
```

Register a new game:

```typescript
const soar = SoarProgram.get(provider);
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

Provides a set of methods for conveniently bundling transactions.

```typescript
const transaction = await this.builder
      .andInitializePlayer({username, nftMeta}, user)
      .andRegisterPlayerEntry(/*...*/)
      .andSubmitScoreToLeaderboard(/*...*/)
      .and(/*some other transaction*/)
      .then((builder) => builder.build());
```

## Contributing

The community is encouraged to contribute to the Soar SDK.

Fixes and features are always welcome! Please feel free to submit a PR for review.

### Tests.

Test files are located in `client/tests/*`. To run the tests, enter `anchor test` from the root directory of the repository.
