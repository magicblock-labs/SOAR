use super::*;
use crate::SoarError;

impl LeaderBoard {
    pub const SIZE: usize = 8 + // discriminator
        32 + (4 + MAX_DESCRIPTION_LEN) + 32 + 1 + 8 + 8 + (1 + 32);

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
            top_entries: None,
        }
    }

    pub fn check_field_lengths(&self) -> Result<()> {
        if self.description.len() > MAX_DESCRIPTION_LEN {
            return Err(SoarError::InvalidFieldLength.into());
        }

        Ok(())
    }
}

impl RegisterLeaderBoardInput {
    pub fn into_leaderboard(self, game: Pubkey, id: u64) -> LeaderBoard {
        LeaderBoard::new(
            id,
            game,
            self.description,
            self.nft_meta,
            self.decimals,
            self.min_score,
            self.max_score,
        )
    }

    pub fn check_field_lengths(&self) -> Result<()> {
        if self.description.len() > MAX_DESCRIPTION_LEN {
            return Err(SoarError::InvalidFieldLength.into());
        }

        Ok(())
    }
}

impl ScoreEntry {
    pub const SIZE: usize = 8 + 8;

    pub fn new(score: u64, timestamp: i64) -> Self {
        ScoreEntry { score, timestamp }
    }
}

impl LeaderTopEntries {
    pub fn size(scores_to_retain: usize) -> usize {
        8/*discrimator*/ + 1/*bool*/ + (4 + (scores_to_retain * LeaderBoardScore::SIZE))
        /*top_scores vec*/
    }
}

impl LeaderBoardScore {
    pub const SIZE: usize = 32 + ScoreEntry::SIZE;

    pub fn new(user: Pubkey, entry: ScoreEntry) -> Self {
        LeaderBoardScore { user, entry }
    }
}
