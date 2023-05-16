use super::*;
use crate::SoarError;

impl Game {
    pub const SIZE_WITHOUT_AUTHS: usize = 8 + // discriminator 
        GameMeta::SIZE + 8 + 8;

    pub fn size_with_auths(auth_len: usize) -> usize {
        Self::SIZE_WITHOUT_AUTHS + 4 + (auth_len * 32)
    }

    pub fn check_signer_is_authority(&self, key: &Pubkey) -> bool {
        self.auth.contains(key)
    }

    pub fn set_meta(&mut self, new_meta: GameMeta) {
        self.meta = new_meta;
    }
}

impl GameMeta {
    pub const SIZE: usize = (4 + MAX_TITLE_LEN) + (4 + MAX_DESCRIPTION_LEN) + 1 + 1 + 32;

    pub fn new(
        title: String,
        description: String,
        genre: u8,
        game_type: u8,
        nft_meta: Pubkey,
    ) -> Self {
        GameMeta {
            title,
            description,
            genre,
            game_type,
            nft_meta,
        }
    }

    pub fn check_field_lengths(&self) -> Result<()> {
        if self.title.len() > MAX_TITLE_LEN || self.description.len() > MAX_DESCRIPTION_LEN {
            return Err(SoarError::InvalidFieldLength.into());
        }

        Ok(())
    }
}
