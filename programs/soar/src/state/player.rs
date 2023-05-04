use super::*;
use crate::CrateError;

impl PlayerInfo {
    pub const MAX_USERNAME_LEN: usize = 100;

    pub const SIZE: usize = 8 + // discriminator                
        8 + 32 + Self::MAX_USERNAME_LEN + 8 + 32;

    pub fn new(id: u64, username: String, rank: u64, nft_meta: Pubkey, user: Pubkey) -> Self {
        PlayerInfo {
            id,
            user,
            username,
            rank,
            nft_meta,
        }
    }

    pub fn check_field_lengths(&self) -> Result<()> {
        if self.username.len() > Self::MAX_USERNAME_LEN {
            return Err(CrateError::InvalidFieldLength.into());
        }

        Ok(())
    }
}

impl PlayerEntryList {
    pub const SIZE_WITHOUT_VEC: usize = 8 + // discriminator
        32 + 32 + 8;
    /// We initially allocate space for 10 [ScoreEntry] objects and realloc if more is needed.
    pub const INITIAL_SCORES_LENGTH: usize = 10;
    /// How much more space for [ScoreEntry] objects we add during a resize.
    pub const REALLOC_WINDOW: usize = 10;

    /// Calculate the space required during initialization
    pub fn initial_size() -> usize {
        Self::SIZE_WITHOUT_VEC + 4 + (Self::INITIAL_SCORES_LENGTH * ScoreEntry::SIZE)
    }

    pub fn new(player_info: Pubkey, leaderboard: Pubkey) -> Self {
        PlayerEntryList {
            player_info,
            leaderboard,
            score_count: 0,
            scores: Vec::with_capacity(Self::INITIAL_SCORES_LENGTH),
        }
    }
}

impl ScoreEntry {
    pub const SIZE: usize = 8 + 8;

    pub fn new(score: u64, timestamp: i64) -> Self {
        ScoreEntry { score, timestamp }
    }
}
