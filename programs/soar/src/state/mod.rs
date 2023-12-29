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
    pub is_ascending: bool,

    /// Whether or not multiple scores are kept in the leaderboard for a single player.
    pub allow_multiple_scores: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
/// Input to add a new reward for an achievement.
pub struct AddNewRewardInput {
    /// Number of rewards to be given out.
    pub available_spots: u64,
    /// Specific reward kind.
    pub kind: RewardKindInput,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
/// Specific variant of [AddNewRewardInput].
pub enum RewardKindInput {
    Ft {
        /// Amount to be delegated to this program's PDA
        /// so it can spend for reward claims.
        deposit: u64,

        /// Amount given to a single user.
        amount: u64,
    },
    Nft {
        /// Uri of the minted nft.
        uri: String,
        /// Name of the minted nft.
        name: String,
        /// Symbol of the minted nft.
        symbol: String,
    },
}
