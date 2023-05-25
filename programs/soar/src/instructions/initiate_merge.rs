use crate::{state::MergeApproval, InitiateMerge};
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<InitiateMerge>, keys: Vec<Pubkey>) -> Result<()> {
    let merge_account = &mut ctx.accounts.merge_account;
    let player_key = &ctx.accounts.player_account.key();

    merge_account.initiator = ctx.accounts.user.key();
    merge_account.approvals = crate::dedup_input(player_key, keys)
        .0
        .into_iter()
        .map(MergeApproval::new)
        .collect();
    merge_account.merge_complete = merge_account.approvals.is_empty();

    Ok(())
}
