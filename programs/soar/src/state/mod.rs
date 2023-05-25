mod achievement;
mod check_fields;
mod game;
mod game_types;
mod leaderboard;
mod merge;
mod player;
mod player_achievement;
mod player_scores_list;
mod reward;
mod top_entries;

pub use achievement::*;
pub use check_fields::*;
pub use game::*;
pub use game_types::*;
pub use leaderboard::*;
pub use merge::*;
pub use player::*;
pub use player_achievement::*;
pub use player_scores_list::*;
pub use reward::*;
pub use top_entries::*;

use anchor_lang::prelude::*;

#[constant]
pub const MAX_TITLE_LEN: usize = 30;
#[constant]
pub const MAX_DESCRIPTION_LEN: usize = 200;

/// Parameters needed when registering a leaderboard.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, Default)]
pub struct RegisterLeaderBoardInput {
    /// Leaderboard description.
    pub description: String,

    /// Nft metadata representing the leaderboard.
    pub nft_meta: Pubkey,

    /// Specify the decimals score values are represented in. Defaults to `0` if [None].
    pub decimals: Option<u8>,

    /// Specifies minimum allowed score. Defaults to `u64::MIN` if [None].
    pub min_score: Option<u64>,

    /// Specifies maximum allowed score. Defaults to `u64::MAX` if [None].
    pub max_score: Option<u64>,

    /// Number of top scores to store on-chain.
    pub scores_to_retain: u8,

    /// Order by which scores are stored. `true` for ascending, `false` for descending.
    pub scores_order: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
/// Input to add a new reward for an achievement.
pub struct AddNewRewardInput {
    /// Rewards given per user.
    pub amount_per_user: u64,
    /// Number of reward spots.
    pub available_rewards: u64,
    /// Specific reward kind.
    pub kind: RewardKindInput,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
/// Specific variant of [AddNewRewardInput].
pub enum RewardKindInput {
    Ft {
        deposit: u64,
        mint: Pubkey,
    },
    Nft {
        uri: String,
        name: String,
        symbol: String,
    },
}
