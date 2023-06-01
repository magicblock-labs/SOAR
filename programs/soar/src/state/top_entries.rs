use super::ScoreEntry;
use anchor_lang::prelude::*;

/// Keeps track of a sorted list of top scores for a leaderboard.
///
/// Seeds = [b"top-scores", leaderboard.key().as_ref()]
#[account]
#[derive(Debug)]
pub struct LeaderTopEntries {
    /// Arrangement order.
    pub is_ascending: bool,

    /// Top scores.
    pub top_scores: Vec<LeaderBoardScore>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Debug)]
/// An single entry to a [LeaderTopEntries].
pub struct LeaderBoardScore {
    /// The player
    pub player: Pubkey,

    /// The user's [score][super::ScoreEntry].
    pub entry: ScoreEntry,
}

impl LeaderTopEntries {
    /// Calculate the size for a given `top_scores` vector length.
    pub fn size(scores_to_retain: usize) -> usize {
        8 + // discriminator
        1 + // is_ascending
        4 + (scores_to_retain * LeaderBoardScore::SIZE) // top_scores vec
    }
}

impl LeaderBoardScore {
    /// Size of a borsh-serialized [LeaderBoardScore] account.
    pub const SIZE: usize = 32 + // player key
        ScoreEntry::SIZE; // entry

    /// Create a new instance of Self.
    pub fn new(player: Pubkey, entry: ScoreEntry) -> Self {
        LeaderBoardScore { player, entry }
    }
}
