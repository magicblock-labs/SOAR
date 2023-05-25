use super::{MAX_DESCRIPTION_LEN, MAX_TITLE_LEN};
use anchor_lang::prelude::*;

#[account]
#[derive(Debug)]
/// Represents an achievement(with optional rewards) for this game
/// that can be attained by players.
///
/// PDA with seeds = `[b"achievement", game.key().as_ref(), &id.to_le_bytes()]`
///
/// `id` is an incrementing index stored in the game account.
pub struct Achievement {
    /// Public key of the game account this achievement is derived from.
    pub game: Pubkey,

    /// The achievement_count of the game account when this account was
    /// created, also used as a seed for its PDA.
    pub id: u64,

    /// Achievement title.
    pub title: String,

    /// Achievement description.
    pub description: String,

    /// Public key of a nft metadata account describing this achievement.
    pub nft_meta: Pubkey,

    /// Optional: Specify a reward to players for unlocking this achievement.
    pub reward: Option<Pubkey>,
}

impl Achievement {
    /// Size of a borsh-serialized achievement account.
    pub const SIZE: usize = 8 + // discriminator
        32 + // game
        8 +  // id
        4 + MAX_TITLE_LEN + // title
        4 + MAX_DESCRIPTION_LEN + // description
        32 + // nft_meta
        1 + 32; // reward

    /// Create a new [Achievement] instance.
    pub fn new(
        game: Pubkey,
        title: String,
        description: String,
        nft_meta: Pubkey,
        id: u64,
    ) -> Self {
        Achievement {
            game,
            id,
            title,
            description,
            nft_meta,
            reward: None,
        }
    }
}
