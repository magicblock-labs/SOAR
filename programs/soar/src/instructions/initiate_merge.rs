use crate::{state::MergeInfo, InitiateMerge};
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<InitiateMerge>, keys: Vec<Pubkey>) -> Result<()> {
    let merge_account = &mut ctx.accounts.merge_account;
    let player_key = &ctx.accounts.player.key();

    merge_account.initiator = ctx.accounts.user.key();
    merge_account.others = crate::dedup_input(player_key, keys)
        .0
        .into_iter()
        .map(MergeInfo::new)
        .collect();
    merge_account.merge_complete = merge_account.others.is_empty();

    Ok(())
}
