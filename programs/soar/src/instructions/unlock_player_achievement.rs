use crate::UnlockPlayerAchievement;
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<UnlockPlayerAchievement>) -> Result<()> {
    let achievement = &mut ctx.accounts.player_achievement;
    let clock = Clock::get().unwrap();

    achievement.player = ctx.accounts.player_info.key();
    achievement.achievement = ctx.accounts.achievement.key();
    achievement.timestamp = clock.unix_timestamp;
    achievement.unlocked = true;

    Ok(())
}
