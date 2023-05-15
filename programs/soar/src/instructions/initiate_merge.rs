use crate::state::{MergeInfo, Merged};
use crate::utils::create_account;
use crate::{state::Player, InitiateMerge};
use anchor_lang::prelude::*;
use std::collections::HashSet;

pub fn handler<'a>(ctx: Context<'_, '_, '_, 'a, InitiateMerge<'a>>) -> Result<()> {
    let accounts_to_merge = &mut ctx.remaining_accounts.iter();

    let keys: Vec<Pubkey> = accounts_to_merge
        .map(|account| {
            // Guarantee that it is a valid [Player] account.
            let _ = Account::<'a, Player>::try_from(account).ok();
            account.key()
        })
        .collect::<HashSet<_>>()
        .into_iter()
        .collect();

    let merge_account = &ctx.accounts.merge_account;
    let user = &ctx.accounts.user;
    let system_program = &ctx.accounts.system_program;

    let create_size = Merged::size(keys.len());
    create_account(create_size, merge_account, user, system_program)?;

    let mut merge_account = Account::<'_, Merged>::try_from(merge_account)?;
    merge_account.initiator = user.key();
    merge_account.others = keys.into_iter().map(MergeInfo::new).collect();
    merge_account.merge_complete = merge_account.others.is_empty();

    Ok(())
}
