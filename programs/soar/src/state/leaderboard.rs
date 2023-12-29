use super::{RegisterLeaderBoardInput, MAX_DESCRIPTION_LEN};
use anchor_lang::prelude::*;

/// A single score entry for a player.
#[derive(AnchorSerialize, AnchorDeserialize, Copy, Clone, Debug, Default)]
pub struct ScoreEntry {
    /// The player's score.
    pub score: u64,

    /// When this entry was made.
    pub timestamp: i64,
}

#[account]
#[derive(Debug, Default)]
/// Represents a [Game][super::Game]'s leaderboard.
///
/// Seeds: `[b"leaderboard", game.key().as_ref(), &id.to_le_bytes()]`
pub struct LeaderBoard {
    /// The leaderboard's id, used in deriving its address from the game.
    pub id: u64,

    /// The game this leaderboard belongs to and is derived from.
    pub game: Pubkey,

    /// Leaderboard description.
    pub description: String,

    /// Pubkey of an nft metadata account that describes this leaderboard.
    pub nft_meta: Pubkey,

    /// Used to contextualize scores for this leaderboard.
    pub decimals: u8,

    /// Minimum possible score for this leaderboard.
    pub min_score: u64,

    /// Maximum possible score for this leaderboard.
    pub max_score: u64,

    /// Top [entries](ScoreEntry) for a leaderboard.
    pub top_entries: Option<Pubkey>,

    /// Whether or not multiple scores are allowed for a single player.
    pub allow_multiple_scores: bool,
}

impl LeaderBoard {
    /// Size of a borsh-serialized leaderboard account.
    pub const SIZE: usize = 8 + // discriminator
        8 + // id
        32 + // game
        4 + MAX_DESCRIPTION_LEN + // description 
        32 + // nft_meta
        1 +  // decimals
        8 +  // min_score
        8 +  // max_score
        1 + // allow_multiple_scores
        1 + 32; // top_entries

    /// Create a new [LeaderBoard] instance.
    pub fn new(
        id: u64,
        game: Pubkey,
        description: String,
        nft_meta: Pubkey,
        decimals: Option<u8>,
        min_score: Option<u64>,
        max_score: Option<u64>,
    ) -> Self {
        LeaderBoard {
            id,
            game,
            description,
            nft_meta,
            decimals: decimals.unwrap_or(0),
            min_score: min_score.unwrap_or(u64::MIN),
            max_score: max_score.unwrap_or(u64::MAX),
            allow_multiple_scores: false,
            top_entries: None,
        }
    }
}

impl From<RegisterLeaderBoardInput> for LeaderBoard {
    fn from(input: RegisterLeaderBoardInput) -> Self {
        LeaderBoard {
            description: input.description,
            nft_meta: input.nft_meta,
            decimals: input.decimals.unwrap_or(0),
            min_score: input.min_score.unwrap_or(u64::MIN),
            max_score: input.max_score.unwrap_or(u64::MAX),
            allow_multiple_scores: input.allow_multiple_scores,
            ..Default::default()
        }
    }
}

impl ScoreEntry {
    /// Size of a [ScoreEntry].
    pub const SIZE: usize = 8 + 8;

    /// Create a new instance of self.
    pub fn new(score: u64, timestamp: i64) -> Self {
        ScoreEntry { score, timestamp }
    }
}
