use super::*;
use crate::SoarError;

impl Player {
    pub const MAX_USERNAME_LEN: usize = 100;

    pub const SIZE: usize = 8 + // discriminator                
        32 + Self::MAX_USERNAME_LEN + 32;

    pub fn new(username: String, nft_meta: Pubkey, user: Pubkey) -> Self {
        Player {
            user,
            username,
            nft_meta,
        }
    }

    pub fn check_field_lengths(&self) -> Result<()> {
        if self.username.len() > Self::MAX_USERNAME_LEN {
            return Err(SoarError::InvalidFieldLength.into());
        }

        Ok(())
    }
}

impl PlayerEntryList {
    pub const SIZE_WITHOUT_VEC: usize = 8 + // discriminator
        32 + 32 + 2;
    /// We initially allocate space for 10 [ScoreEntry] objects and realloc if more is needed.
    pub const INITIAL_SCORES_LENGTH: usize = 10;
    /// How much more space for [ScoreEntry] objects we add during a resize.
    pub const REALLOC_WINDOW: usize = 10;

    /// Calculate the space required during initialization
    pub fn initial_size() -> usize {
        Self::SIZE_WITHOUT_VEC + 4 + (Self::INITIAL_SCORES_LENGTH * ScoreEntry::SIZE)
    }

    pub fn current_size(&self) -> usize {
        Self::SIZE_WITHOUT_VEC + 4 + (self.alloc_count as usize * ScoreEntry::SIZE)
    }

    pub fn new(player_info: Pubkey, leaderboard: Pubkey) -> Self {
        PlayerEntryList {
            player_info,
            leaderboard,
            alloc_count: Self::INITIAL_SCORES_LENGTH as u16,
            scores: Vec::with_capacity(Self::INITIAL_SCORES_LENGTH),
        }
    }
}

impl Merged {
    pub fn size(count: usize) -> usize {
        8 + 32 + (4 + (count * ScoreEntry::SIZE)) + 1
    }
}

impl MergeInfo {
    pub const SIZE: usize = 32 + 1;
    
    pub fn new(key: Pubkey) -> Self {
        MergeInfo {
            key,
            approved: false,
        }
    }
}
