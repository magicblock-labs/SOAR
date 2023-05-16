use super::*;
use crate::SoarError;

impl Achievement {
    pub const SIZE: usize = 8 + // discriminator
        32 + (4 + MAX_TITLE_LEN) + (4 + MAX_DESCRIPTION_LEN) + 32 + (1 + 32)/*Option<Pubkey>*/;

    pub fn new(game: Pubkey, title: String, description: String, nft_meta: Pubkey) -> Self {
        Achievement {
            game,
            title,
            description,
            nft_meta,
            reward: None,
        }
    }

    pub fn check_field_lengths(&self) -> Result<()> {
        if self.title.len() > MAX_TITLE_LEN || self.description.len() > MAX_DESCRIPTION_LEN {
            return Err(SoarError::InvalidFieldLength.into());
        }

        Ok(())
    }
}

impl Reward {
    #[constant]
    const MAX_URI_LENGTH: usize = 200;
    #[constant]
    const MAX_NAME_LENGTH: usize = 32;
    #[constant]
    const MAX_SYMBOL_LENGTH: usize = 10;
    pub const SIZE: usize = 8 + // discriminator
        32 + (4 + 200)/*URI*/ + (4 + 32)/*NAME*/ + (4 + 10)/*SYMBOL*/ + 8 + ( 1+ 32);

    pub fn check_field_lengths(&self) -> Result<()> {
        if self.uri.len() > Self::MAX_URI_LENGTH
            || self.name.len() > Self::MAX_NAME_LENGTH
            || self.symbol.len() > Self::MAX_SYMBOL_LENGTH
        {
            return Err(SoarError::InvalidFieldLength.into());
        }
        Ok(())
    }
}

impl PlayerAchievement {
    pub const SIZE: usize = 8 + // discriminator
        32 + 32 + 8 + 1 + (1+32)/*optional metadata*/;
}
