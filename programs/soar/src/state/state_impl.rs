use super::types::*;
use crate::error::CrateError;
use anchor_lang::prelude::*;

pub const MAX_TITLE_LEN: usize = 30;
pub const MAX_DESCRIPTION_LEN: usize = 200;

impl Game {
    const MAX_GENRE_LEN: usize = 40;
    const MAX_TYPE_LEN: usize = 20;

    pub const SIZE_WITHOUT_AUTHS: usize = 8 + // discriminator                 
        GameMeta::SIZE + 8 + 4; // empty vec

    pub fn calculate_size(auth_len: usize) -> usize {
        Self::SIZE_WITHOUT_AUTHS + (auth_len * 32)
    }

    pub fn check_signer_is_auth(&self, key: &Pubkey) -> bool {
        self.auth.contains(key)
    }

    pub fn set_meta(&mut self, new_meta: GameMeta) {
        self.meta = new_meta;
    }

    pub fn set_auth(&mut self, new_auth: Vec<Pubkey>) {
        self.auth = new_auth;
    }
}

impl GameMeta {
    pub const SIZE: usize = (4 + MAX_TITLE_LEN)
        + (4 + MAX_DESCRIPTION_LEN)
        + (4 + Game::MAX_GENRE_LEN)
        + (4 + Game::MAX_TYPE_LEN)
        + 32;

    pub fn new(
        title: String,
        description: String,
        genre: String,
        game_type: String,
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
        if self.title.len() > MAX_TITLE_LEN
            || self.description.len() > MAX_DESCRIPTION_LEN
            || self.genre.len() > Game::MAX_GENRE_LEN
            || self.game_type.len() > Game::MAX_TYPE_LEN
        {
            return Err(CrateError::InvalidFieldLength.into());
        }

        Ok(())
    }
}

impl LeaderBoard {
    pub const SIZE: usize = 8 + // discriminator
        8 + (4 + MAX_DESCRIPTION_LEN) + 32;

    pub fn new(id: u64, description: String, nft_meta: Pubkey) -> Self {
        LeaderBoard {
            id,
            description,
            nft_meta,
        }
    }
}

impl RegisterLeaderBoardInput {
    pub fn into_leaderboard(self, id: u64) -> LeaderBoard {
        LeaderBoard::new(id, self.description, self.nft_meta)
    }

    pub fn check_field_lengths(&self) -> Result<()> {
        if self.description.len() > MAX_DESCRIPTION_LEN {
            return Err(CrateError::InvalidFieldLength.into());
        }

        Ok(())
    }
}

impl Achievement {
    pub const SIZE: usize = 8 + // discriminator
        32 + (4 + MAX_TITLE_LEN) + (4 + MAX_DESCRIPTION_LEN) + 32
            + Reward::SIZE;

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

impl PlayerInfo {
    pub const MAX_USERNAME_LEN: usize = 100;

    pub const SIZE: usize = 8 + // discriminator                  
        8 + Self::MAX_USERNAME_LEN + 8 + 32;

    pub fn new(id: u64, username: String, rank: u64, nft_meta: Pubkey) -> Self {
        PlayerInfo {
            id,
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

impl PlayerEntry {
    pub const SIZE_WITHOUT_ENTRIES: usize = 8 + // discriminator
        32 + 4; // empty vec

    pub fn calculate_size(entry_len: usize) -> usize {
        Self::SIZE_WITHOUT_ENTRIES + (entry_len * Entry::SIZE)
    }
}

impl Entry {
    pub const SIZE: usize = 8 + 8;
}

impl PlayerAchievement {
    pub const SIZE: usize = 8 + // discriminator
        32 + 32 + 8 + 1;
}

impl Reward {
    pub const SIZE: usize = 1;

    pub fn new() -> Self {
        Reward { x: 8 }
    }
}
