use super::{MAX_DESCRIPTION_LEN, MAX_TITLE_LEN};
use anchor_lang::prelude::*;

#[account]
#[derive(Debug, Default)]
/// An account representing a single game.
pub struct Game {
    /// Game meta-information.
    pub meta: GameAttributes,

    /// Number of leaderboards this game has created. Used both
    /// in determining the most recent leaderboard address, and
    /// as a seed for the next leaderboard.
    pub leaderboard_count: u64,

    /// Number of achievements that exist for this game. Also
    /// used to determine the u64 seed for the next achievement.
    pub achievement_count: u64,

    /// A collection of pubkeys which each represent a valid
    /// authority for this game.
    pub auth: Vec<Pubkey>,
}

impl Game {
    /// Base size of a game account, not counting the auth vec.
    pub const SIZE_NO_AUTHS: usize = 8 + // discriminator
        GameAttributes::SIZE + // GameMeta fixed size
        8 + // leaderboard_count
        8; // achievement_count

    /// The size of a game account, considering a auth vec of
    /// size `auths_len`.
    pub fn size(auth_len: usize) -> usize {
        Self::SIZE_NO_AUTHS + // Base size
        4 + (auth_len * 32) // Auths vector.
    }

    /// Check that a given pubkey is one of the Game's authorities.
    pub fn check_signer(&self, key: &Pubkey) -> bool {
        self.auth.contains(key)
    }

    /// Set a game's attributes.
    pub fn set_attributes(&mut self, new_meta: GameAttributes) {
        self.meta = new_meta;
    }

    /// Get next achievement id.
    pub fn next_achievement(&self) -> u64 {
        self.achievement_count.checked_add(1).unwrap()
    }

    /// Get next leaderboard id.
    pub fn next_leaderboard(&self) -> u64 {
        self.leaderboard_count.checked_add(1).unwrap()
    }
}

/// A type that represents game-specific information.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, Default)]
pub struct GameAttributes {
    /// The title of the game, max length = 30 bytes.
    pub title: String,

    /// The game description, max length = 200 bytes.
    pub description: String,

    /// The game's [genre](super::Genre), as a u8.
    pub genre: u8,

    /// The game's [type](super::GameType), as a u8.
    pub game_type: u8,

    /// An nft metadata account describing the game.
    pub nft_meta: Pubkey,
}

impl GameAttributes {
    /// The constant borsh-serialized size of a [GameAttributes] account.
    pub const SIZE: usize = 4 + MAX_TITLE_LEN + // title
        4 + MAX_DESCRIPTION_LEN + // description
        1 + // genre as u8
        1 + // game_type as u8
        32; // nft_meta

    /// Create a new [GameAttributes] instance.
    pub fn new(
        title: String,
        description: String,
        genre: u8,
        game_type: u8,
        nft_meta: Pubkey,
    ) -> Self {
        GameAttributes {
            title,
            description,
            genre,
            game_type,
            nft_meta,
        }
    }
}
