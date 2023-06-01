use crate::{state::PlayerAchievement, UnlockPlayerAchievement};
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<UnlockPlayerAchievement>) -> Result<()> {
    let pa_account = &mut ctx.accounts.player_achievement;
    let clock = Clock::get().unwrap();

    let obj = PlayerAchievement::new(
        ctx.accounts.player_account.key(),
        ctx.accounts.achievement.key(),
        clock.unix_timestamp,
    );

    pa_account.set_inner(obj);
    Ok(())
}
