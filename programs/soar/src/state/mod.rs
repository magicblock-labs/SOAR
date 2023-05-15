mod achievement;
mod game;
mod leaderboard;
mod player;
mod score;

use anchor_lang::prelude::*;

#[constant]
pub const MAX_TITLE_LEN: usize = 30;
#[constant]
pub const MAX_DESCRIPTION_LEN: usize = 200;

#[account]
#[derive(Default)]
/// An account representing a single game.
///
pub struct Game {
    /// Game information.
    pub meta: GameMeta,
    /// The id of the currently active leaderboard.
    pub leaderboard: u64,
    /// A collection of pubkeys which are valid authorities for the game.
    pub auth: Vec<Pubkey>,
}

/// Parameters used together with a [Vec] of [Pubkey]s in initializing a [Game]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
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
/// Represents a [Game]'s leaderboard.
///
/// Seeds: `[b"leaderboard", game.key().as_ref()]`
pub struct LeaderBoard {
    /// The leaderboard's id, used in deriving its address from the game.
    pub id: u64,
    /// The game this leaderboard belongs to
    pub game: Pubkey,
    /// Leaderboard description.
    pub description: String,
    /// Metadata to represent the leaderboard.
    pub nft_meta: Pubkey,
}

/// Represents a single achievement for a [Game].
///
/// Seeds = `[b"achievement", game.key().as_ref(), title.as_bytes()]`
#[account]
pub struct Achievement {
    /// The game account it derives from.
    pub game: Pubkey,
    /// The title of this achievement.
    pub title: String,
    /// A description of the achievement.
    pub description: String,
    /// Metadata representing this achievement.
    pub nft_meta: Pubkey,
    /// Whether to mint a reward for unlocking this achievement.
    pub reward: Option<Pubkey>,
}

/// Contains details of a NFT reward.
#[account]
pub struct Reward {
    pub achievement: Pubkey,
    /// URI of the NFT to be minted.
    pub uri: String,
    /// Name of the NFT to be minted.
    pub name: String,
    /// Symbol of the NFT to be minted.
    pub symbol: String,
    /// Number of nft rewards given so far.
    pub minted: u64,
    /// Optional: A collection to verify a minted nft as belonging to.
    pub collection_mint: Option<Pubkey>,
}

#[account]
#[derive(Default)]
/// An account representing a player.
///
/// Seeds: `[b"player", user.key().as_ref()]`
pub struct Player {
    /// The wallet that owns this player-info account
    pub user: Pubkey,
    /// The player's username.
    pub username: String,
    /// The player's ranking.
    pub rank: u64,
    /// Metadata to represent this player.
    pub nft_meta: Pubkey,
}

/// An account that represents a single user's ownership of
/// multiple [Player] accounts.
#[account]
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
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MergeInfo {
    pub key: Pubkey,
    pub approved: bool,
}

#[account]
#[derive(Default)]
/// Represents a [Player]'s collection of score entries([Entry]) for a particular [LeaderBoard].
///
/// Seeds: `[b"entry", player_info.key().as_ref(), leaderboard.key().as_ref()]`
pub struct PlayerEntryList {
    /// The player_info account this entry is derived from
    pub player_info: Pubkey,
    /// The leaderboard this entry derives from.
    // TODO: Get rid.
    pub leaderboard: Pubkey,
    /// Keep track of how many [StoreEntry]s are in the scores vec.
    // TODO: Get rid.
    pub score_count: u64,
    /// Collection of entries.
    pub scores: Vec<ScoreEntry>,
    // TODO:(Vec<Entry>) Push and realloc each time, or realloc in batches and keep
    // track of size.
}

/// A single score entry for a player.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct ScoreEntry {
    /// The player's score for this entry.
    pub score: u64,
    /// When this entry was made.
    pub timestamp: i64,
}

#[account]
#[derive(Default)]
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
    /// This is [Some] only if the player has minted a reward for the achievement.
    pub metadata: Option<Pubkey>,
}

/// Parameters needed when registering a leaderboard.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct RegisterLeaderBoardInput {
    pub description: String,
    pub nft_meta: Pubkey,
}

/// Parameters used for registering metadata information for an nft reward.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct RegisterNewRewardInput {
    pub uri: String,
    pub name: String,
    pub symbol: String,
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
