export type Soar = {
  "version": "0.1.0",
  "name": "soar",
  "instructions": [
    {
      "name": "initializeGame",
      "docs": [
        "Initialize a new [Game] and register its [LeaderBoard]."
      ],
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameMeta",
          "type": {
            "defined": "GameMeta"
          }
        },
        {
          "name": "gameAuth",
          "type": {
            "vec": "publicKey"
          }
        }
      ]
    },
    {
      "name": "updateGame",
      "docs": [
        "Update a [Game]'s meta-information or authority list."
      ],
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newMeta",
          "type": {
            "option": {
              "defined": "GameMeta"
            }
          }
        },
        {
          "name": "newAuth",
          "type": {
            "option": {
              "vec": "publicKey"
            }
          }
        }
      ]
    },
    {
      "name": "addAchievement",
      "docs": [
        "Add a new [Achievement] that can be attained for a particular [Game]."
      ],
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newAchievement",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "nftMeta",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updateAchievement",
      "docs": [
        "Update an [Achievement]'s meta information."
      ],
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "achievement",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newTitle",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "newDescription",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "nftMeta",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "addLeaderboard",
      "docs": [
        "Overwrite the active [LeaderBoard] and set a newly created one."
      ],
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "leaderboard",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "TODO: Close previous leaderboard account?"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "input",
          "type": {
            "defined": "RegisterLeaderBoardInput"
          }
        }
      ]
    },
    {
      "name": "createPlayer",
      "docs": [
        "Create a [PlayerInfo] account for a particular user."
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        },
        {
          "name": "nftMeta",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updatePlayer",
      "docs": [
        "Update the username or nft_meta for a [PlayerInfo] account."
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "playerInfo",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "username",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "nftMeta",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "registerPlayer",
      "docs": [
        "Register a [PlayerInfo] for a particular [Leaderboard], resulting in a newly-",
        "created [PlayerEntryList] account."
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerInfo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leaderboard",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newList",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "submitScore",
      "docs": [
        "Submit a score for a player and have it timestamped and added to the [PlayerEntryList].",
        "Optionally increase the player's rank if needed."
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "playerInfo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leaderboard",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerEntries",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "score",
          "type": "u64"
        },
        {
          "name": "rank",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "mergePlayerAccounts",
      "docs": [
        "Merge multiple accounts as belonging to the same user. The `hint` argument",
        "specifies the number of additional accounts to be merged."
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerInfo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mergeAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "hint",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unlockPlayerAchievement",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerInfo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerEntry",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leaderboard",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "achievement",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerAchievement",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "addReward",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "achievement",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newReward",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collectionUpdateAuth",
          "isMut": false,
          "isSigner": true,
          "isOptional": true
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "collectionMetadata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "input",
          "type": {
            "defined": "RegisterNewRewardInput"
          }
        }
      ]
    },
    {
      "name": "mintReward",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "achievement",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "reward",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerAchievement",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterEdition",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintNftTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "verifyReward",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "achievement",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "reward",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerAchievement",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataToVerify",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collectionMasterEdition",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "game",
      "docs": [
        "An account representing a single game.",
        "",
        "Seeds: `[b\"game\", creator.key().as_ref()]`"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "meta",
            "docs": [
              "Game information."
            ],
            "type": {
              "defined": "GameMeta"
            }
          },
          {
            "name": "leaderboard",
            "docs": [
              "The id of the currently active leaderboard."
            ],
            "type": "u64"
          },
          {
            "name": "auth",
            "docs": [
              "A collection of pubkeys which are valid authorities for the game."
            ],
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "leaderBoard",
      "docs": [
        "Represents a [Game]'s leaderboard.",
        "",
        "Seeds: `[b\"leaderboard\", game.key().as_ref()]`"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "docs": [
              "The leaderboard's id, used in deriving its address from the game."
            ],
            "type": "u64"
          },
          {
            "name": "game",
            "docs": [
              "The game this leaderboard belongs to"
            ],
            "type": "publicKey"
          },
          {
            "name": "description",
            "docs": [
              "Leaderboard description."
            ],
            "type": "string"
          },
          {
            "name": "nftMeta",
            "docs": [
              "Metadata to represent the leaderboard."
            ],
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "achievement",
      "docs": [
        "Represents a single achievement for a [Game].",
        "",
        "Seeds = `[b\"achievement\", game.key().as_ref(), title.as_bytes()]`"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "game",
            "docs": [
              "The game account it derives from."
            ],
            "type": "publicKey"
          },
          {
            "name": "title",
            "docs": [
              "The title of this achievement."
            ],
            "type": "string"
          },
          {
            "name": "description",
            "docs": [
              "A description of the achievement."
            ],
            "type": "string"
          },
          {
            "name": "nftMeta",
            "docs": [
              "Metadata representing this achievement."
            ],
            "type": "publicKey"
          },
          {
            "name": "reward",
            "docs": [
              "Whether to mint a reward for unlocking this achievement."
            ],
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "reward",
      "docs": [
        "Contains details of a NFT reward."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "achievement",
            "type": "publicKey"
          },
          {
            "name": "uri",
            "docs": [
              "URI of the NFT to be minted."
            ],
            "type": "string"
          },
          {
            "name": "name",
            "docs": [
              "Name of the NFT to be minted."
            ],
            "type": "string"
          },
          {
            "name": "symbol",
            "docs": [
              "Symbol of the NFT to be minted."
            ],
            "type": "string"
          },
          {
            "name": "minted",
            "docs": [
              "Number of nft rewards given so far."
            ],
            "type": "u64"
          },
          {
            "name": "collectionMint",
            "docs": [
              "Optional: A collection to verify a minted nft as belonging to."
            ],
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "player",
      "docs": [
        "An account representing a player.",
        "",
        "Seeds: `[b\"player\", user.key().as_ref()]`"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "docs": [
              "The wallet that owns this player-info account"
            ],
            "type": "publicKey"
          },
          {
            "name": "username",
            "docs": [
              "The player's username."
            ],
            "type": "string"
          },
          {
            "name": "rank",
            "docs": [
              "The player's ranking."
            ],
            "type": "u64"
          },
          {
            "name": "nftMeta",
            "docs": [
              "Metadata to represent this player."
            ],
            "type": "publicKey"
          },
          {
            "name": "merged",
            "docs": [
              "Address of a [Merged] account that contains a list of all other",
              "[PlayerInfo] accounts owned by the same user of this account."
            ],
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "merged",
      "docs": [
        "An account that holds a collection of [PlayerInfo]s that belong to the",
        "same player."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "keys",
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "playerEntryList",
      "docs": [
        "Represents a [PlayerInfo]'s collection of score entries([Entry]) for a particular [LeaderBoard].",
        "",
        "Seeds: `[b\"entry\", player_info.key().as_ref(), leaderboard.key().as_ref()]`"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "playerInfo",
            "docs": [
              "The player_info account this entry is derived from"
            ],
            "type": "publicKey"
          },
          {
            "name": "leaderboard",
            "docs": [
              "The leaderboard this entry derives from."
            ],
            "type": "publicKey"
          },
          {
            "name": "scoreCount",
            "docs": [
              "Keep track of how many [StoreEntry]s are in the scores vec."
            ],
            "type": "u64"
          },
          {
            "name": "scores",
            "docs": [
              "Collection of entries."
            ],
            "type": {
              "vec": {
                "defined": "ScoreEntry"
              }
            }
          }
        ]
      }
    },
    {
      "name": "playerAchievement",
      "docs": [
        "Represents a player's status for a particular [Achievement].",
        "",
        "Seeds = `[b\"player-achievement\", player.key().as_ref(), achievement.key().as_ref()]`."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "docs": [
              "The player's [PlayerInfo] account."
            ],
            "type": "publicKey"
          },
          {
            "name": "achievement",
            "docs": [
              "The key of the [Achievement] unlocked for this player."
            ],
            "type": "publicKey"
          },
          {
            "name": "timestamp",
            "docs": [
              "Timestamp showing when this achievement was unlocked."
            ],
            "type": "i64"
          },
          {
            "name": "unlocked",
            "docs": [
              "True for unlocked, false for locked."
            ],
            "type": "bool"
          },
          {
            "name": "metadata",
            "docs": [
              "This is [Some] only if the player has minted a reward for the achievement."
            ],
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "GameMeta",
      "docs": [
        "Parameters used together with a [Vec] of [Pubkey]s in initializing a [Game]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "title",
            "docs": [
              "The title of the game, max length = 30 bytes"
            ],
            "type": "string"
          },
          {
            "name": "description",
            "docs": [
              "The game description, max length = 200 bytes"
            ],
            "type": "string"
          },
          {
            "name": "genre",
            "docs": [
              "The genre, max length = 40 bytes"
            ],
            "type": "string"
          },
          {
            "name": "gameType",
            "docs": [
              "The type, max length = 20 bytes"
            ],
            "type": "string"
          },
          {
            "name": "nftMeta",
            "docs": [
              "A mpl collection key representing this game"
            ],
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "ScoreEntry",
      "docs": [
        "A single score entry for a player."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "score",
            "docs": [
              "The player's score for this entry."
            ],
            "type": "u64"
          },
          {
            "name": "timestamp",
            "docs": [
              "When this entry was made."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "RegisterLeaderBoardInput",
      "docs": [
        "Parameters needed when registering a leaderboard."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "nftMeta",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "RegisterNewRewardInput",
      "docs": [
        "Parameters used for registering metadata information for an nft reward."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidFieldLength",
      "msg": "Exceeded max length for field."
    },
    {
      "code": 6001,
      "name": "InvalidAuthority",
      "msg": "Invalid authority for instruction."
    },
    {
      "code": 6002,
      "name": "MissingSignature",
      "msg": "An expected signature isn't present."
    },
    {
      "code": 6003,
      "name": "NoRewardForAchievement",
      "msg": "Reward not specified for this achievement."
    }
  ]
};

export const IDL: Soar = {
  "version": "0.1.0",
  "name": "soar",
  "instructions": [
    {
      "name": "initializeGame",
      "docs": [
        "Initialize a new [Game] and register its [LeaderBoard]."
      ],
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameMeta",
          "type": {
            "defined": "GameMeta"
          }
        },
        {
          "name": "gameAuth",
          "type": {
            "vec": "publicKey"
          }
        }
      ]
    },
    {
      "name": "updateGame",
      "docs": [
        "Update a [Game]'s meta-information or authority list."
      ],
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newMeta",
          "type": {
            "option": {
              "defined": "GameMeta"
            }
          }
        },
        {
          "name": "newAuth",
          "type": {
            "option": {
              "vec": "publicKey"
            }
          }
        }
      ]
    },
    {
      "name": "addAchievement",
      "docs": [
        "Add a new [Achievement] that can be attained for a particular [Game]."
      ],
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newAchievement",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "nftMeta",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updateAchievement",
      "docs": [
        "Update an [Achievement]'s meta information."
      ],
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "achievement",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newTitle",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "newDescription",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "nftMeta",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "addLeaderboard",
      "docs": [
        "Overwrite the active [LeaderBoard] and set a newly created one."
      ],
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "leaderboard",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "TODO: Close previous leaderboard account?"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "input",
          "type": {
            "defined": "RegisterLeaderBoardInput"
          }
        }
      ]
    },
    {
      "name": "createPlayer",
      "docs": [
        "Create a [PlayerInfo] account for a particular user."
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        },
        {
          "name": "nftMeta",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updatePlayer",
      "docs": [
        "Update the username or nft_meta for a [PlayerInfo] account."
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "playerInfo",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "username",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "nftMeta",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "registerPlayer",
      "docs": [
        "Register a [PlayerInfo] for a particular [Leaderboard], resulting in a newly-",
        "created [PlayerEntryList] account."
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerInfo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leaderboard",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newList",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "submitScore",
      "docs": [
        "Submit a score for a player and have it timestamped and added to the [PlayerEntryList].",
        "Optionally increase the player's rank if needed."
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "playerInfo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leaderboard",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerEntries",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "score",
          "type": "u64"
        },
        {
          "name": "rank",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "mergePlayerAccounts",
      "docs": [
        "Merge multiple accounts as belonging to the same user. The `hint` argument",
        "specifies the number of additional accounts to be merged."
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerInfo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mergeAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "hint",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unlockPlayerAchievement",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerInfo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerEntry",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leaderboard",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "achievement",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerAchievement",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "addReward",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "achievement",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newReward",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collectionUpdateAuth",
          "isMut": false,
          "isSigner": true,
          "isOptional": true
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "collectionMetadata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "input",
          "type": {
            "defined": "RegisterNewRewardInput"
          }
        }
      ]
    },
    {
      "name": "mintReward",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "achievement",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "reward",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerAchievement",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterEdition",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintNftTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "verifyReward",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "achievement",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "reward",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerAchievement",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataToVerify",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collectionMasterEdition",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "game",
      "docs": [
        "An account representing a single game.",
        "",
        "Seeds: `[b\"game\", creator.key().as_ref()]`"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "meta",
            "docs": [
              "Game information."
            ],
            "type": {
              "defined": "GameMeta"
            }
          },
          {
            "name": "leaderboard",
            "docs": [
              "The id of the currently active leaderboard."
            ],
            "type": "u64"
          },
          {
            "name": "auth",
            "docs": [
              "A collection of pubkeys which are valid authorities for the game."
            ],
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "leaderBoard",
      "docs": [
        "Represents a [Game]'s leaderboard.",
        "",
        "Seeds: `[b\"leaderboard\", game.key().as_ref()]`"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "docs": [
              "The leaderboard's id, used in deriving its address from the game."
            ],
            "type": "u64"
          },
          {
            "name": "game",
            "docs": [
              "The game this leaderboard belongs to"
            ],
            "type": "publicKey"
          },
          {
            "name": "description",
            "docs": [
              "Leaderboard description."
            ],
            "type": "string"
          },
          {
            "name": "nftMeta",
            "docs": [
              "Metadata to represent the leaderboard."
            ],
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "achievement",
      "docs": [
        "Represents a single achievement for a [Game].",
        "",
        "Seeds = `[b\"achievement\", game.key().as_ref(), title.as_bytes()]`"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "game",
            "docs": [
              "The game account it derives from."
            ],
            "type": "publicKey"
          },
          {
            "name": "title",
            "docs": [
              "The title of this achievement."
            ],
            "type": "string"
          },
          {
            "name": "description",
            "docs": [
              "A description of the achievement."
            ],
            "type": "string"
          },
          {
            "name": "nftMeta",
            "docs": [
              "Metadata representing this achievement."
            ],
            "type": "publicKey"
          },
          {
            "name": "reward",
            "docs": [
              "Whether to mint a reward for unlocking this achievement."
            ],
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "reward",
      "docs": [
        "Contains details of a NFT reward."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "achievement",
            "type": "publicKey"
          },
          {
            "name": "uri",
            "docs": [
              "URI of the NFT to be minted."
            ],
            "type": "string"
          },
          {
            "name": "name",
            "docs": [
              "Name of the NFT to be minted."
            ],
            "type": "string"
          },
          {
            "name": "symbol",
            "docs": [
              "Symbol of the NFT to be minted."
            ],
            "type": "string"
          },
          {
            "name": "minted",
            "docs": [
              "Number of nft rewards given so far."
            ],
            "type": "u64"
          },
          {
            "name": "collectionMint",
            "docs": [
              "Optional: A collection to verify a minted nft as belonging to."
            ],
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "player",
      "docs": [
        "An account representing a player.",
        "",
        "Seeds: `[b\"player\", user.key().as_ref()]`"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "docs": [
              "The wallet that owns this player-info account"
            ],
            "type": "publicKey"
          },
          {
            "name": "username",
            "docs": [
              "The player's username."
            ],
            "type": "string"
          },
          {
            "name": "rank",
            "docs": [
              "The player's ranking."
            ],
            "type": "u64"
          },
          {
            "name": "nftMeta",
            "docs": [
              "Metadata to represent this player."
            ],
            "type": "publicKey"
          },
          {
            "name": "merged",
            "docs": [
              "Address of a [Merged] account that contains a list of all other",
              "[PlayerInfo] accounts owned by the same user of this account."
            ],
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "merged",
      "docs": [
        "An account that holds a collection of [PlayerInfo]s that belong to the",
        "same player."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "keys",
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "playerEntryList",
      "docs": [
        "Represents a [PlayerInfo]'s collection of score entries([Entry]) for a particular [LeaderBoard].",
        "",
        "Seeds: `[b\"entry\", player_info.key().as_ref(), leaderboard.key().as_ref()]`"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "playerInfo",
            "docs": [
              "The player_info account this entry is derived from"
            ],
            "type": "publicKey"
          },
          {
            "name": "leaderboard",
            "docs": [
              "The leaderboard this entry derives from."
            ],
            "type": "publicKey"
          },
          {
            "name": "scoreCount",
            "docs": [
              "Keep track of how many [StoreEntry]s are in the scores vec."
            ],
            "type": "u64"
          },
          {
            "name": "scores",
            "docs": [
              "Collection of entries."
            ],
            "type": {
              "vec": {
                "defined": "ScoreEntry"
              }
            }
          }
        ]
      }
    },
    {
      "name": "playerAchievement",
      "docs": [
        "Represents a player's status for a particular [Achievement].",
        "",
        "Seeds = `[b\"player-achievement\", player.key().as_ref(), achievement.key().as_ref()]`."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "docs": [
              "The player's [PlayerInfo] account."
            ],
            "type": "publicKey"
          },
          {
            "name": "achievement",
            "docs": [
              "The key of the [Achievement] unlocked for this player."
            ],
            "type": "publicKey"
          },
          {
            "name": "timestamp",
            "docs": [
              "Timestamp showing when this achievement was unlocked."
            ],
            "type": "i64"
          },
          {
            "name": "unlocked",
            "docs": [
              "True for unlocked, false for locked."
            ],
            "type": "bool"
          },
          {
            "name": "metadata",
            "docs": [
              "This is [Some] only if the player has minted a reward for the achievement."
            ],
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "GameMeta",
      "docs": [
        "Parameters used together with a [Vec] of [Pubkey]s in initializing a [Game]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "title",
            "docs": [
              "The title of the game, max length = 30 bytes"
            ],
            "type": "string"
          },
          {
            "name": "description",
            "docs": [
              "The game description, max length = 200 bytes"
            ],
            "type": "string"
          },
          {
            "name": "genre",
            "docs": [
              "The genre, max length = 40 bytes"
            ],
            "type": "string"
          },
          {
            "name": "gameType",
            "docs": [
              "The type, max length = 20 bytes"
            ],
            "type": "string"
          },
          {
            "name": "nftMeta",
            "docs": [
              "A mpl collection key representing this game"
            ],
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "ScoreEntry",
      "docs": [
        "A single score entry for a player."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "score",
            "docs": [
              "The player's score for this entry."
            ],
            "type": "u64"
          },
          {
            "name": "timestamp",
            "docs": [
              "When this entry was made."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "RegisterLeaderBoardInput",
      "docs": [
        "Parameters needed when registering a leaderboard."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "nftMeta",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "RegisterNewRewardInput",
      "docs": [
        "Parameters used for registering metadata information for an nft reward."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidFieldLength",
      "msg": "Exceeded max length for field."
    },
    {
      "code": 6001,
      "name": "InvalidAuthority",
      "msg": "Invalid authority for instruction."
    },
    {
      "code": 6002,
      "name": "MissingSignature",
      "msg": "An expected signature isn't present."
    },
    {
      "code": 6003,
      "name": "NoRewardForAchievement",
      "msg": "Reward not specified for this achievement."
    }
  ]
};
