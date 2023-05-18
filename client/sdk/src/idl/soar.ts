export type Soar = {
  "version": "0.1.0",
  "name": "soar",
  "constants": [
    {
      "name": "MAX_TITLE_LEN",
      "type": {
        "defined": "usize"
      },
      "value": "30"
    },
    {
      "name": "MAX_DESCRIPTION_LEN",
      "type": {
        "defined": "usize"
      },
      "value": "200"
    }
  ],
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
          "isSigner": true
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
          "name": "leaderboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "topEntries",
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
        "Create a [Player] account for a particular user."
      ],
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": false,
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
        "Update the username or nft_meta for a [Player] account."
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
        "Register a [Player] for a particular [Leaderboard], resulting in a newly-",
        "created [PlayerEntryList] account."
      ],
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
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
          "isMut": false,
          "isSigner": true
        },
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
          "name": "topEntries",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "playerEntries",
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
          "name": "score",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initiateMerge",
      "docs": [
        "Initialize a new merge account and await approval from the verified users of all the",
        "specified [Player] accounts."
      ],
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mergeAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "keys",
          "type": {
            "vec": "publicKey"
          }
        }
      ]
    },
    {
      "name": "registerMergeApproval",
      "docs": [
        "Register merge confirmation for a particular [Player] account included in a [Merged]."
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "playerInfo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mergeAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "unlockPlayerAchievement",
      "docs": [
        "Indicate that a player has completed some [Achievement] and create a [PlayerAchievement]",
        "as proof."
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
          "name": "user",
          "isMut": false,
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
      "docs": [
        "Optional: Add an NFT-based [Reward] for unlocking some [Achievement]."
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
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "achievement",
          "isMut": true,
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
      "docs": [
        "Mint an NFT reward for unlocking a [PlayerAchievement] account.",
        "",
        "Optional: Only relevant if an NFT reward is specified for that achievement."
      ],
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
          "isMut": true,
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
      "docs": [
        "Verify NFT reward as belonging to a particular collection.",
        "",
        "Optional: Only relevant if an NFT reward is specified and the reward's",
        "`collection_mint` is Some(...)"
      ],
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
        ""
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
            "name": "leaderboardCount",
            "docs": [
              "Number of leaderboards this game has created. Used both in determining the",
              "most recent leaderboard address, and as a seed for the next leaderboard."
            ],
            "type": "u64"
          },
          {
            "name": "achievementCount",
            "docs": [
              "Number of achievements that exist for this game. Used in determining",
              "the u64 index for the next achievement."
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
              "The game this leaderboard belongs to."
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
          },
          {
            "name": "decimals",
            "docs": [
              "Interpreted as a factor of 10 and used as a divisor for contextualizing scores."
            ],
            "type": "u8"
          },
          {
            "name": "minScore",
            "docs": [
              "Minimum possible score for this leaderboard."
            ],
            "type": "u64"
          },
          {
            "name": "maxScore",
            "docs": [
              "Maximum possible score for this leaderboard."
            ],
            "type": "u64"
          },
          {
            "name": "topEntries",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "leaderTopEntries",
      "docs": [
        "Extra leaderboard details for keeping track of scores.",
        "",
        "Seeds = [b\"top-scores\", leaderboard.key().as_ref()]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isAscending",
            "docs": [
              "Arrangement order."
            ],
            "type": "bool"
          },
          {
            "name": "topScores",
            "docs": [
              "Top scores."
            ],
            "type": {
              "vec": {
                "defined": "LeaderBoardScore"
              }
            }
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
            "name": "nftMeta",
            "docs": [
              "Metadata to represent this player."
            ],
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "merged",
      "docs": [
        "An account that represents a single user's ownership of",
        "multiple [Player] accounts."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initiator",
            "docs": [
              "The user that initialized this merge."
            ],
            "type": "publicKey"
          },
          {
            "name": "others",
            "docs": [
              "Details of all the [Player] accounts to be merged with the main_user's."
            ],
            "type": {
              "vec": {
                "defined": "MergeInfo"
              }
            }
          },
          {
            "name": "mergeComplete",
            "docs": [
              "Whether or not full permissions are granted and the merge complete."
            ],
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "playerEntryList",
      "docs": [
        "Represents a [Player]'s collection of score entries([ScoreEntry]) for a particular [LeaderBoard].",
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
            "name": "allocCount",
            "docs": [
              "Max number of [ScoreEntry] objects the current space allocation supports."
            ],
            "type": "u16"
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
              "The player's [Player] account."
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
              "The [Genre], stored as a u8."
            ],
            "type": "u8"
          },
          {
            "name": "gameType",
            "docs": [
              "The [GameType], stored as a u8"
            ],
            "type": "u8"
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
      "name": "LeaderBoardScore",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "entry",
            "type": {
              "defined": "ScoreEntry"
            }
          }
        ]
      }
    },
    {
      "name": "MergeInfo",
      "docs": [
        "Represents a [Player] account that's included in the merge and indicates",
        "if the authority of that account has granted permission."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": "publicKey"
          },
          {
            "name": "approved",
            "type": "bool"
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
            "docs": [
              "Leaderboard description."
            ],
            "type": "string"
          },
          {
            "name": "nftMeta",
            "docs": [
              "Nft metadata representing the leaderboard."
            ],
            "type": "publicKey"
          },
          {
            "name": "decimals",
            "docs": [
              "Specify the decimals score values are represented in. Defaults to `0` if [None]."
            ],
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "minScore",
            "docs": [
              "Specifies minimum allowed score. Defaults to `u64::MIN` if [None]."
            ],
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "maxScore",
            "docs": [
              "Specifies maximum allowed score. Defaults to `u64::MAX` if [None]."
            ],
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "scoresToRetain",
            "docs": [
              "Number of top scores to store on-chain."
            ],
            "type": "u8"
          },
          {
            "name": "scoresOrder",
            "docs": [
              "Order by which scores are stored. `true` for ascending, `false` for descending."
            ],
            "type": "bool"
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
    },
    {
      "name": "GameType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Mobile"
          },
          {
            "name": "Desktop"
          },
          {
            "name": "Web"
          },
          {
            "name": "Unspecified"
          }
        ]
      }
    },
    {
      "name": "Genre",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Rpg"
          },
          {
            "name": "Mmo"
          },
          {
            "name": "Action"
          },
          {
            "name": "Adventure"
          },
          {
            "name": "Puzzle"
          },
          {
            "name": "Casual"
          },
          {
            "name": "Unspecified"
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
    },
    {
      "code": 6004,
      "name": "AccountNotPartOfMerge",
      "msg": "The merge account does not include this player account"
    },
    {
      "code": 6005,
      "name": "ScoreNotWithinBounds",
      "msg": "Tried to input score that is below the minimum or above the maximum"
    }
  ]
};

export const IDL: Soar = {
  "version": "0.1.0",
  "name": "soar",
  "constants": [
    {
      "name": "MAX_TITLE_LEN",
      "type": {
        "defined": "usize"
      },
      "value": "30"
    },
    {
      "name": "MAX_DESCRIPTION_LEN",
      "type": {
        "defined": "usize"
      },
      "value": "200"
    }
  ],
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
          "isSigner": true
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
          "name": "leaderboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "topEntries",
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
        "Create a [Player] account for a particular user."
      ],
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": false,
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
        "Update the username or nft_meta for a [Player] account."
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
        "Register a [Player] for a particular [Leaderboard], resulting in a newly-",
        "created [PlayerEntryList] account."
      ],
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
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
          "isMut": false,
          "isSigner": true
        },
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
          "name": "topEntries",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "playerEntries",
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
          "name": "score",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initiateMerge",
      "docs": [
        "Initialize a new merge account and await approval from the verified users of all the",
        "specified [Player] accounts."
      ],
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mergeAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "keys",
          "type": {
            "vec": "publicKey"
          }
        }
      ]
    },
    {
      "name": "registerMergeApproval",
      "docs": [
        "Register merge confirmation for a particular [Player] account included in a [Merged]."
      ],
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "playerInfo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mergeAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "unlockPlayerAchievement",
      "docs": [
        "Indicate that a player has completed some [Achievement] and create a [PlayerAchievement]",
        "as proof."
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
          "name": "user",
          "isMut": false,
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
      "docs": [
        "Optional: Add an NFT-based [Reward] for unlocking some [Achievement]."
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
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "achievement",
          "isMut": true,
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
      "docs": [
        "Mint an NFT reward for unlocking a [PlayerAchievement] account.",
        "",
        "Optional: Only relevant if an NFT reward is specified for that achievement."
      ],
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
          "isMut": true,
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
      "docs": [
        "Verify NFT reward as belonging to a particular collection.",
        "",
        "Optional: Only relevant if an NFT reward is specified and the reward's",
        "`collection_mint` is Some(...)"
      ],
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
        ""
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
            "name": "leaderboardCount",
            "docs": [
              "Number of leaderboards this game has created. Used both in determining the",
              "most recent leaderboard address, and as a seed for the next leaderboard."
            ],
            "type": "u64"
          },
          {
            "name": "achievementCount",
            "docs": [
              "Number of achievements that exist for this game. Used in determining",
              "the u64 index for the next achievement."
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
              "The game this leaderboard belongs to."
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
          },
          {
            "name": "decimals",
            "docs": [
              "Interpreted as a factor of 10 and used as a divisor for contextualizing scores."
            ],
            "type": "u8"
          },
          {
            "name": "minScore",
            "docs": [
              "Minimum possible score for this leaderboard."
            ],
            "type": "u64"
          },
          {
            "name": "maxScore",
            "docs": [
              "Maximum possible score for this leaderboard."
            ],
            "type": "u64"
          },
          {
            "name": "topEntries",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "leaderTopEntries",
      "docs": [
        "Extra leaderboard details for keeping track of scores.",
        "",
        "Seeds = [b\"top-scores\", leaderboard.key().as_ref()]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isAscending",
            "docs": [
              "Arrangement order."
            ],
            "type": "bool"
          },
          {
            "name": "topScores",
            "docs": [
              "Top scores."
            ],
            "type": {
              "vec": {
                "defined": "LeaderBoardScore"
              }
            }
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
            "name": "nftMeta",
            "docs": [
              "Metadata to represent this player."
            ],
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "merged",
      "docs": [
        "An account that represents a single user's ownership of",
        "multiple [Player] accounts."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initiator",
            "docs": [
              "The user that initialized this merge."
            ],
            "type": "publicKey"
          },
          {
            "name": "others",
            "docs": [
              "Details of all the [Player] accounts to be merged with the main_user's."
            ],
            "type": {
              "vec": {
                "defined": "MergeInfo"
              }
            }
          },
          {
            "name": "mergeComplete",
            "docs": [
              "Whether or not full permissions are granted and the merge complete."
            ],
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "playerEntryList",
      "docs": [
        "Represents a [Player]'s collection of score entries([ScoreEntry]) for a particular [LeaderBoard].",
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
            "name": "allocCount",
            "docs": [
              "Max number of [ScoreEntry] objects the current space allocation supports."
            ],
            "type": "u16"
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
              "The player's [Player] account."
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
              "The [Genre], stored as a u8."
            ],
            "type": "u8"
          },
          {
            "name": "gameType",
            "docs": [
              "The [GameType], stored as a u8"
            ],
            "type": "u8"
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
      "name": "LeaderBoardScore",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "entry",
            "type": {
              "defined": "ScoreEntry"
            }
          }
        ]
      }
    },
    {
      "name": "MergeInfo",
      "docs": [
        "Represents a [Player] account that's included in the merge and indicates",
        "if the authority of that account has granted permission."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": "publicKey"
          },
          {
            "name": "approved",
            "type": "bool"
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
            "docs": [
              "Leaderboard description."
            ],
            "type": "string"
          },
          {
            "name": "nftMeta",
            "docs": [
              "Nft metadata representing the leaderboard."
            ],
            "type": "publicKey"
          },
          {
            "name": "decimals",
            "docs": [
              "Specify the decimals score values are represented in. Defaults to `0` if [None]."
            ],
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "minScore",
            "docs": [
              "Specifies minimum allowed score. Defaults to `u64::MIN` if [None]."
            ],
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "maxScore",
            "docs": [
              "Specifies maximum allowed score. Defaults to `u64::MAX` if [None]."
            ],
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "scoresToRetain",
            "docs": [
              "Number of top scores to store on-chain."
            ],
            "type": "u8"
          },
          {
            "name": "scoresOrder",
            "docs": [
              "Order by which scores are stored. `true` for ascending, `false` for descending."
            ],
            "type": "bool"
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
    },
    {
      "name": "GameType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Mobile"
          },
          {
            "name": "Desktop"
          },
          {
            "name": "Web"
          },
          {
            "name": "Unspecified"
          }
        ]
      }
    },
    {
      "name": "Genre",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Rpg"
          },
          {
            "name": "Mmo"
          },
          {
            "name": "Action"
          },
          {
            "name": "Adventure"
          },
          {
            "name": "Puzzle"
          },
          {
            "name": "Casual"
          },
          {
            "name": "Unspecified"
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
    },
    {
      "code": 6004,
      "name": "AccountNotPartOfMerge",
      "msg": "The merge account does not include this player account"
    },
    {
      "code": 6005,
      "name": "ScoreNotWithinBounds",
      "msg": "Tried to input score that is below the minimum or above the maximum"
    }
  ]
};
