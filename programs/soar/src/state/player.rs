use anchor_lang::prelude::*;

#[account]
#[derive(Debug, Default)]
/// An account representing a player.
///
/// Seeds: `[b"player", user.key().as_ref()]`
pub struct Player {
    /// The wallet that owns this player-info account
    pub user: Pubkey,

    /// The player's username.
    pub username: String,

    /// Metadata to represent this player.
    pub nft_meta: Pubkey,
}

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
}
