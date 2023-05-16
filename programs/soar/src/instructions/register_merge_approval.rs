use crate::{error::SoarError, RegisterMergeApproval};
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<RegisterMergeApproval>) -> Result<()> {
    let merge_account = &mut ctx.accounts.merge_account;
    let player_account = &ctx.accounts.player_info;
    let others = &mut merge_account.others;

    let found = others
        .iter_mut()
        .find(|other| other.key == player_account.key());

    if found.is_none() {
        return Err(SoarError::AccountNotPartOfMerge.into());
    }

    let merge = found.unwrap();
    merge.approved = true;

    if !others.iter().any(|info| !info.approved) {
        // Failed to find any unapproved key hence merge complete!
        merge_account.merge_complete = true;
    }

    Ok(())
}
