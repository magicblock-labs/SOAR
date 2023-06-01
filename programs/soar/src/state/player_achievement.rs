use anchor_lang::prelude::*;

#[account]
#[derive(Debug, Default)]
/// Represents a player's status for a particular [Achievement](super::Achievement).
///
/// Seeds = `[b"player-achievement", player.key().as_ref(), achievement.key().as_ref()]`.
pub struct PlayerAchievement {
    /// The user's [player][super::Player] account.
    pub player_account: Pubkey,

    /// The key of the achievement unlocked for this player.
    pub achievement: Pubkey,

    /// Timestamp showing when this achievement was unlocked.
    pub timestamp: i64,

    /// A player's unlock status for this achievement.
    pub unlocked: bool,

    /// Whether or not this player has claimed their reward.
    pub claimed: bool,
}

impl PlayerAchievement {
    /// Size of a serialized playerAchievement account.
    pub const SIZE: usize = 8 + // discriminator
        32 + // player
        32 + // achievement
        8 +  // timestamp
        1 +  // unlocked
        1; // claimed

    pub fn new(player_account: Pubkey, achievement: Pubkey, timestamp: i64) -> Self {
        Self {
            player_account,
            achievement,
            timestamp,
            unlocked: true,
            claimed: false,
        }
    }
}
