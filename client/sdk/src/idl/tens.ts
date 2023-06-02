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
            "name": "soarState",
            "docs": [
              "The soar state."
            ],
            "type": "publicKey"
          },
          {
            "name": "soarLeaderboard",
            "docs": [
              "The currently active soar leaderboard."
            ],
            "type": "publicKey"
          },
          {
            "name": "counter",
            "docs": [
              "The game counter."
            ],
            "type": "u64"
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
            "name": "soarState",
            "docs": [
              "The soar state."
            ],
            "type": "publicKey"
          },
          {
            "name": "soarLeaderboard",
            "docs": [
              "The currently active soar leaderboard."
            ],
            "type": "publicKey"
          },
          {
            "name": "counter",
            "docs": [
              "The game counter."
            ],
            "type": "u64"
          }
        ]
      }
    }
  ]
};
