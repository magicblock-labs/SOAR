use super::*;
use crate::CrateError;

impl LeaderBoard {
    pub const SIZE: usize = 8 + // discriminator
        32 + (4 + MAX_DESCRIPTION_LEN) + 32;

    pub fn new(id: u64, game: Pubkey, description: String, nft_meta: Pubkey) -> Self {
        LeaderBoard {
            id,
            game,
            description,
            nft_meta,
        }
    }
}

impl RegisterLeaderBoardInput {
    pub fn into_leaderboard(self, game: Pubkey, id: u64) -> LeaderBoard {
        LeaderBoard::new(id, game, self.description, self.nft_meta)
    }

    pub fn check_field_lengths(&self) -> Result<()> {
        if self.description.len() > MAX_DESCRIPTION_LEN {
            return Err(CrateError::InvalidFieldLength.into());
        }

        Ok(())
    }
}
