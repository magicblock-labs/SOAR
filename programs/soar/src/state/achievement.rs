use super::*;
use crate::CrateError;

impl Achievement {
    pub const SIZE: usize = 8 + // discriminator
        32 + (4 + MAX_TITLE_LEN) + (4 + MAX_DESCRIPTION_LEN) + 32 + Reward::SIZE;

    pub fn new(
        game: Pubkey,
        title: String,
        description: String,
        nft_meta: Pubkey,
        reward: Reward,
    ) -> Self {
        Achievement {
            game,
            title,
            description,
            nft_meta,
            reward,
        }
    }

    pub fn check_field_lengths(&self) -> Result<()> {
        if self.title.len() > MAX_TITLE_LEN || self.description.len() > MAX_DESCRIPTION_LEN {
            return Err(CrateError::InvalidFieldLength.into());
        }

        Ok(())
    }
}

impl PlayerAchievement {
    pub const SIZE: usize = 8 + // discriminator
        32 + 32 + 8 + 1;
}
