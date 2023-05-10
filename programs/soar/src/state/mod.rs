mod achievement;
mod game;
mod leaderboard;
mod player;
mod score;

use anchor_lang::prelude::*;

pub const MAX_TITLE_LEN: usize = 30;
pub const MAX_DESCRIPTION_LEN: usize = 200;

#[account]
#[derive(Default)]
/// An account representing a single game.
///
/// Seeds: `[b"game", creator.key().as_ref()]`
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
    /// The genre, max length = 40 bytes
    pub genre: String,
    /// The type, max length = 20 bytes
    pub game_type: String,
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
    /// Address of a [Merged] account that contains a list of all other
    /// [PlayerInfo] accounts owned by the same user of this account.
    pub merged: Pubkey,
}

#[account]
#[derive(Default)]
/// An account that holds a collection of [PlayerInfo]s that belong to the
/// same player.
pub struct Merged {
    pub keys: Vec<Pubkey>,
}

#[account]
#[derive(Default)]
/// Represents a [PlayerInfo]'s collection of score entries([Entry]) for a particular [LeaderBoard].
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
    /// The player's [PlayerInfo] account.
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
