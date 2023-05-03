use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
/// An account representing a single game.
///
/// Seeds: `[b"game", creator.key().as_ref()]`
pub struct Game {
    /// Game information.
    pub meta: GameMeta,
    /// The id of the current leaderboard.
    pub current_leaderboard: u64,
    /// A collection of pubkeys which are valid authorities for the game.
    pub auth: Vec<Pubkey>,
}

#[account]
/// Represents a [Game]'s leaderboard.
///
/// Seeds: `[b"leaderboard", game.key().as_ref()]`
pub struct LeaderBoard {
    /// The leaderboard's id, used in deriving its address from the game.
    pub id: u64,
    /// Leaderboard description.
    pub description: String,
    /// Metadata to represent the leaderboard.
    pub nft_meta: Pubkey,
}

/// Represents a single achievement for a [Game].
///
/// Seeds = `[b"achievement", game.key().as_ref(), id.to_le_bytes().as_ref()]`
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
    /// The earned reward from unlocking this achievement.
    pub reward: Reward,
}

/// Placeholder type. TODO: Replace
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct Reward {
    pub x: u8,
}

#[account]
#[derive(Default)]
/// An account representing a player.
///
/// Seeds: `[b"player", player_wallet.key().as_ref(), username.to_le_bytes()]`
pub struct PlayerInfo {
    /// The player's unique id.
    pub id: u64,
    /// The player's username.
    pub username: String,
    /// The player's ranking.
    pub rank: u64,
    /// Metadata to represent this player.
    pub nft_meta: Pubkey,
}

#[account]
#[derive(Default)]
/// Represents a collection of score entries([Entry]) for a single [PlayerInfo].
///
/// Seeds: `[player.key().as_ref(), leaderboard.key().as_ref()]`
pub struct PlayerEntry {
    /// The player that owns these entries.
    pub player: Pubkey,
    /// The leaderboard this entry derives from.
    pub leaderboard: Pubkey,
    /// Collection of entries.
    pub scores: Vec<Entry>,
}

/// A single score entry for a player.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct Entry {
    /// The player's score for this entry.
    pub score: u64,
    /// When this entry was made.
    pub timestamp: i64,
}

#[account]
#[derive(Default)]
/// Represents a player's status for a particular [Achievement].
///
/// Seeds = `[player.key().as_ref(), achievement.key().as_ref()]`.
pub struct PlayerAchievement {
    /// The player's [PlayerInfo] account.
    pub player: Pubkey,
    /// The key of the [Achievement] unlocked for this player.
    pub achievement: Pubkey,
    /// Timestamp showing when this achievement was unlocked.
    pub timestamp: i64,
    /// True for unlocked, false for locked.
    pub status: bool,
}

/// Parameters used with a [Vec<Pubkey>] in initializing a [Game]
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

/// Parameters needed when registering a leaderboard
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct RegisterLeaderBoardInput {
    pub description: String,
    pub nft_meta: Pubkey,
}
