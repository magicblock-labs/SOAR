use crate::{error::SoarError, ApproveMerge};
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<ApproveMerge>) -> Result<()> {
    let merge_account = &mut ctx.accounts.merge_account;
    let player_account = &ctx.accounts.player_account;
    let approvals = &mut merge_account.approvals;

    let found = approvals
        .iter_mut()
        .find(|one| one.key == player_account.key());

    if found.is_none() {
        return Err(SoarError::AccountNotPartOfMerge.into());
    }

    let merge = found.unwrap();
    merge.approved = true;

    if !approvals.iter().any(|info| !info.approved) {
        // Failed to find any unapproved key hence merge complete!
        merge_account.merge_complete = true;
    }

    Ok(())
}
