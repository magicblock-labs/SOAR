export type Tens = {
  "version": "0.1.0",
  "name": "tens",
  "instructions": [
    {
      "name": "register",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tensState",
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
          "name": "soarState",
          "type": "publicKey"
        },
        {
          "name": "soarLeaderboard",
          "type": "publicKey"
        },
        {
          "name": "soarLeaderboardTopEntries",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "makeMove",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tensState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "soarState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "soarLeaderboard",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "soarPlayerAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "soarPlayerScores",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "soarTopEntries",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "soarProgram",
          "isMut": false,
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
      "name": "claimReward",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tensState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "soarPlayerScores",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "soarTopEntries",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "soarState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "soarAchievement",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "soarReward",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "soarPlayerAchievement",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sourceTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "soarProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "tens",
      "docs": [
        "A simple game."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "counter",
            "docs": [
              "The game counter."
            ],
            "type": "u64"
          },
          {
            "name": "soar",
            "docs": [
              "The SOAR keys for this program."
            ],
            "type": {
              "defined": "SoarKeysStorage"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "SoarKeysStorage",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "state",
            "docs": [
              "The soar state for this game."
            ],
            "type": "publicKey"
          },
          {
            "name": "leaderboard",
            "docs": [
              "The soar leaderboard for this game."
            ],
            "type": "publicKey"
          },
          {
            "name": "topEntries",
            "docs": [
              "The soar top-entries account for this game."
            ],
            "type": "publicKey"
          }
        ]
      }
    }
  ]
};

export const IDL: Tens = {
  "version": "0.1.0",
  "name": "tens",
  "instructions": [
    {
      "name": "register",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tensState",
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
          "name": "soarState",
          "type": "publicKey"
        },
        {
          "name": "soarLeaderboard",
          "type": "publicKey"
        },
        {
          "name": "soarLeaderboardTopEntries",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "makeMove",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tensState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "soarState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "soarLeaderboard",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "soarPlayerAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "soarPlayerScores",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "soarTopEntries",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "soarProgram",
          "isMut": false,
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
      "name": "claimReward",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tensState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "soarPlayerScores",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "soarTopEntries",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "soarState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "soarAchievement",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "soarReward",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "soarPlayerAchievement",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sourceTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "soarProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "tens",
      "docs": [
        "A simple game."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "counter",
            "docs": [
              "The game counter."
            ],
            "type": "u64"
          },
          {
            "name": "soar",
            "docs": [
              "The SOAR keys for this program."
            ],
            "type": {
              "defined": "SoarKeysStorage"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "SoarKeysStorage",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "state",
            "docs": [
              "The soar state for this game."
            ],
            "type": "publicKey"
          },
          {
            "name": "leaderboard",
            "docs": [
              "The soar leaderboard for this game."
            ],
            "type": "publicKey"
          },
          {
            "name": "topEntries",
            "docs": [
              "The soar top-entries account for this game."
            ],
            "type": "publicKey"
          }
        ]
      }
    }
  ]
};
