mod achievement;
mod game;
mod leaderboard;
mod merge;
mod player;
mod reward;

use anchor_lang::prelude::*;

#[constant]
pub const MAX_TITLE_LEN: usize = 30;
#[constant]
pub const MAX_DESCRIPTION_LEN: usize = 200;

#[account]
#[derive(Debug, Default)]
/// An account representing a single game.
///
pub struct Game {
    /// Game information.
    pub meta: GameMeta,
    /// Number of leaderboards this game has created. Used both in determining the
    /// most recent leaderboard address, and as a seed for the next leaderboard.
    pub leaderboard_count: u64,
    /// Number of achievements that exist for this game. Used in determining
    /// the u64 index for the next achievement.
    pub achievement_count: u64,
    /// A collection of pubkeys which are valid authorities for the game.
    pub auth: Vec<Pubkey>,
}

/// Parameters used together with a [Vec] of [Pubkey]s in initializing a [Game]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, Default)]
pub struct GameMeta {
    /// The title of the game, max length = 30 bytes
    pub title: String,
    /// The game description, max length = 200 bytes
    pub description: String,
    /// The [Genre], stored as a u8.
    pub genre: u8,
    /// The [GameType], stored as a u8
    pub game_type: u8,
    /// A mpl collection key representing this game
    pub nft_meta: Pubkey,
}

#[account]
#[derive(Debug)]
/// Represents a [Game]'s leaderboard.
///
/// Seeds: `[b"leaderboard", game.key().as_ref()]`
pub struct LeaderBoard {
    /// The leaderboard's id, used in deriving its address from the game.
    pub id: u64,
    /// The game this leaderboard belongs to.
    pub game: Pubkey,
    /// Leaderboard description.
    pub description: String,
    /// Metadata to represent the leaderboard.
    pub nft_meta: Pubkey,
    /// Interpreted as a factor of 10 and used as a divisor for contextualizing scores.
    pub decimals: u8,
    /// Minimum possible score for this leaderboard.
    pub min_score: u64,
    /// Maximum possible score for this leaderboard.
    pub max_score: u64,
    // Top entries for a leaderboard.
    pub top_entries: Option<Pubkey>,
}

/// Extra leaderboard details for keeping track of scores.
///
/// Seeds = [b"top-scores", leaderboard.key().as_ref()]
#[account]
#[derive(Debug)]
pub struct LeaderTopEntries {
    /// Arrangement order.
    pub is_ascending: bool,
    /// Top scores.
    pub top_scores: Vec<LeaderBoardScore>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Debug)]
pub struct LeaderBoardScore {
    pub user: Pubkey,
    pub entry: ScoreEntry,
}

/// Represents a single achievement for a [Game].
///
/// Seeds = `[b"achievement", game.key().as_ref(), title.as_bytes()]`
#[account]
#[derive(Debug)]
pub struct Achievement {
    /// The game account it derives from.
    pub game: Pubkey,
    /// The title of this achievement.
    pub title: String,
    /// A description of the achievement.
    pub description: String,
    /// Metadata representing this achievement.
    pub nft_meta: Pubkey,
    /// A reward for unlocking this achievement.
    pub reward: Option<Pubkey>,
}

#[account]
#[derive(Debug)]
pub struct Reward {
    /// The achievement this reward is given for.
    pub achievement: Pubkey,
    /// Number of available rewards.
    pub available: u64,
    /// Reward amount per user.
    pub amount_per_user: u64,
    /// The reward type and information.
    pub reward: RewardKind,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum RewardKind {
    /// Represents an `ordinary` token reward(the same mint).
    FungibleToken {
        /// The mint of the token to be given out.
        mint: Pubkey,
        /// The token account to withdraw from.
        token_account: Pubkey,
    },
    /// Represents an nft reward with distinct mints.
    NonFungibleToken {
        /// URI of the NFT to be minted.
        uri: String,
        /// Name of the NFT to be minted.
        name: String,
        /// Symbol of the NFT to be minted.
        symbol: String,
        /// Number of nft rewards given so far.
        minted: u64,
        /// Optional: A collection to verify a minted nft as belonging to.
        collection_mint: Option<Pubkey>,
    },
}

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

/// An account that represents a single user's ownership of
/// multiple [Player] accounts.
#[account]
#[derive(Debug)]
pub struct Merged {
    /// The user that initialized this merge.
    pub initiator: Pubkey,
    /// Details of all the [Player] accounts to be merged with the main_user's.
    pub others: Vec<MergeInfo>,
    /// Whether or not full permissions are granted and the merge complete.
    pub merge_complete: bool,
}

/// Represents a [Player] account that's included in the merge and indicates
/// if the authority of that account has granted permission.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct MergeInfo {
    pub key: Pubkey,
    pub approved: bool,
}

#[account]
#[derive(Debug, Default)]
/// Represents a [Player]'s collection of score entries([ScoreEntry]) for a particular [LeaderBoard].
///
/// Seeds: `[b"entry", player_info.key().as_ref(), leaderboard.key().as_ref()]`
pub struct PlayerEntryList {
    /// The player_info account this entry is derived from
    pub player_info: Pubkey,
    /// The leaderboard this entry derives from.
    pub leaderboard: Pubkey,
    /// Max number of [ScoreEntry] objects the current space allocation supports.
    pub alloc_count: u16,
    /// Collection of entries.
    pub scores: Vec<ScoreEntry>,
}

/// A single score entry for a player.
#[derive(AnchorSerialize, AnchorDeserialize, Copy, Clone, Debug, Default)]
pub struct ScoreEntry {
    /// The player's score for this entry.
    pub score: u64,
    /// When this entry was made.
    pub timestamp: i64,
}

#[account]
#[derive(Debug, Default)]
/// Represents a player's status for a particular [Achievement].
///
/// Seeds = `[b"player-achievement", player.key().as_ref(), achievement.key().as_ref()]`.
pub struct PlayerAchievement {
    /// The player's [Player] account.
    pub player: Pubkey,
    /// The key of the [Achievement] unlocked for this player.
    pub achievement: Pubkey,
    /// Timestamp showing when this achievement was unlocked.
    pub timestamp: i64,
    /// True for unlocked, false for locked.
    pub unlocked: bool,
    /// Whether or not this player has claimed their reward.
    pub claimed: bool,
    /// This is [Some] only if the player has minted an NFT reward pending verification.
    pub nft_reward_mint: Option<Pubkey>,
}

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

/// Parameters used for registering metadata information for an nft reward.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct AddNewRewardArgs {
    pub amount_per_user: u64,
    pub available_rewards: u64,
    pub kind: RewardKindArgs,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum RewardKindArgs {
    Ft {
        initial_delegated_amount: u64,
        mint: Pubkey,
    },
    Nft {
        uri: String,
        name: String,
        symbol: String,
    },
}

pub enum GameType {
    Mobile,
    Desktop,
    Web,
    Unspecified,
}

impl GameType {
    /// Custom to enforce that `unspecified` is always stored as 255,
    /// leaving space to make additions without breaking existing logic.
    pub fn to_u8(&self) -> u8 {
        use GameType::*;
        match self {
            Mobile => 0,
            Desktop => 1,
            Web => 2,
            Unspecified => 255,
        }
    }
}

impl From<u8> for GameType {
    fn from(val: u8) -> Self {
        match val {
            0 => Self::Mobile,
            1 => Self::Desktop,
            2 => Self::Web,
            _ => Self::Unspecified,
        }
    }
}

#[allow(non_snake_case)]
pub enum Genre {
    Rpg,
    Mmo,
    Action,
    Adventure,
    Puzzle,
    Casual,
    Unspecified,
}

impl Genre {
    /// Custom to enforce that `unspecified` is always stored as 255,
    /// leaving space to make additions without breaking existing logic.
    pub fn to_u8(&self) -> u8 {
        use Genre::*;
        match self {
            Rpg => 0,
            Mmo => 1,
            Action => 2,
            Adventure => 3,
            Puzzle => 4,
            Casual => 5,
            Unspecified => 255,
        }
    }
}

impl From<u8> for Genre {
    fn from(val: u8) -> Self {
        match val {
            0 => Self::Rpg,
            1 => Self::Mmo,
            2 => Self::Action,
            3 => Self::Adventure,
            4 => Self::Puzzle,
            5 => Self::Casual,
            _ => Self::Unspecified,
        }
    }
}
