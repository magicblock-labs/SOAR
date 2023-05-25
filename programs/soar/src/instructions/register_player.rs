use crate::{state::PlayerScoresList, RegisterPlayer};
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<RegisterPlayer>) -> Result<()> {
    let player_info = ctx.accounts.player_account.key();
    let leaderboard = ctx.accounts.leaderboard.key();

    let new_list = &mut ctx.accounts.new_list;
    let obj = PlayerScoresList::new(player_info, leaderboard);

    new_list.set_inner(obj);
    Ok(())
}
