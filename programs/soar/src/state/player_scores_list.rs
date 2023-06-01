use super::ScoreEntry;
use anchor_lang::prelude::*;

#[account]
#[derive(Debug, Default)]
/// Holds a list of a [player][super::Player]'s [scores][ScoreEntry])
/// for a particular [LeaderBoard].
///
/// Seeds: `[b"player-scores-list", player_account.key().as_ref(), leaderboard.key().as_ref()]`
pub struct PlayerScoresList {
    /// The player[super::Player] account this entry is derived from
    pub player_account: Pubkey,

    /// The id of the specific leaderboard.
    pub leaderboard: Pubkey,

    /// Max number of [scores][ScoreEntry] the current space allocation supports.
    pub alloc_count: u16,

    /// Collection of [scores][ScoreEntry].
    pub scores: Vec<ScoreEntry>,
}

impl PlayerScoresList {
    /// Base size of this account without counting the scores list.
    pub const SIZE_WITHOUT_VEC: usize = 8 + // discriminator
        32 + // player_account
        32 + // leaderboard
        2; // alloc_count

    /// Initial number of scores[ScoreEntry] space is allocated for.
    pub const INITIAL_SCORES_LENGTH: usize = 10;

    /// Increase space to accommodate this number more  during a resize.
    pub const REALLOC_WINDOW: usize = 10;

    /// Calculate the space required during account initialization
    pub fn initial_size() -> usize {
        Self::SIZE_WITHOUT_VEC + // base size.
        4 + (Self::INITIAL_SCORES_LENGTH * ScoreEntry::SIZE) // size of scores vec.
    }

    /// Gets the current size of a [PlayerScoresList] account.
    pub fn current_size(&self) -> usize {
        Self::SIZE_WITHOUT_VEC + // base size.
        4 + (self.alloc_count as usize * ScoreEntry::SIZE) // size of scores vec.
    }

    /// Create a new instance of Self.
    pub fn new(player_account: Pubkey, leaderboard: Pubkey) -> Self {
        PlayerScoresList {
            player_account,
            leaderboard,
            alloc_count: Self::INITIAL_SCORES_LENGTH as u16,
            scores: Vec::with_capacity(Self::INITIAL_SCORES_LENGTH),
        }
    }
}
