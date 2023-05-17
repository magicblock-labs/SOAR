use crate::state::{MergeInfo, Merged, Player};
use crate::utils::create_account;
use crate::InitiateMerge;
use anchor_lang::{prelude::*, Discriminator};
use std::collections::HashSet;

pub fn handler<'a>(ctx: Context<'_, '_, '_, 'a, InitiateMerge<'a>>) -> Result<()> {
    let accounts_to_merge = &mut ctx.remaining_accounts.iter();

    let keys: Vec<Pubkey> = accounts_to_merge
        .map(|account| {
            // Guarantee that it is a valid `Player` account.
            let _ = Account::<'a, Player>::try_from(account).ok();
            account.key()
        })
        .collect::<HashSet<_>>()
        .into_iter()
        .collect();

    let merge_account = &ctx.accounts.merge_account;
    let payer = &ctx.accounts.payer;
    let system_program = &ctx.accounts.system_program;

    let create_size = Merged::size(keys.len());
    create_account(create_size, merge_account, payer, system_program, None)?;
    // Serialize account discriminator.
    let discriminator = Merged::discriminator();
    discriminator.serialize(&mut &mut merge_account.data.borrow_mut()[..8])?;

    let mut merged = Account::<'_, Merged>::try_from(merge_account)?;
    merged.initiator = ctx.accounts.user.key();
    merged.others = keys.into_iter().map(MergeInfo::new).collect();
    merged.merge_complete = merged.others.is_empty();

    merged.serialize(&mut &mut merge_account.data.borrow_mut()[8..])?;
    Ok(())
}
