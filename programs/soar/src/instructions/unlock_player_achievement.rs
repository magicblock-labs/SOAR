use crate::UnlockPlayerAchievement;
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<UnlockPlayerAchievement>) -> Result<()> {
    let achievement = &mut ctx.accounts.player_achievement;
    let clock = Clock::get().unwrap();

    achievement.player_account = ctx.accounts.player_account.key();
    achievement.achievement = ctx.accounts.achievement.key();
    achievement.timestamp = clock.unix_timestamp;
    achievement.claims = 0;
    achievement.claimed = false;
    achievement.unlocked = true;

    Ok(())
}
