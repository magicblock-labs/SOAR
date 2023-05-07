use anchor_lang::prelude::*;
use anchor_lang::solana_program::account_info::next_account_info;
use crate::state::Merged;
use crate::utils::create_account;
use crate::{state::PlayerInfo, CrateError, MergePlayerAccounts};
use std::collections::HashSet;

/// Merge multiple accounts as belonging to the same user. The `hint` argument
/// specifies the number of additional accounts to be merged.
pub fn handler<'a>(ctx: Context<'_, '_, '_, 'a, MergePlayerAccounts<'a>>, hint: u64) -> Result<()> {
    let active_user = &mut ctx.accounts.user;
    let active_player_info = &ctx.accounts.player_info;
    let merge_account = &ctx.accounts.merge_account;
    let system_program = &ctx.accounts.system_program;

    // We use `ctx.remaining_accounts()` to can pass in a variable number of accounts to be merged. 
    // This requires that the accounts be passed in a specified order i.e: The user account comes
    // first and is followed by the player_account, repeated for as many accounts there are to be merged.
    let accounts_to_merge = &mut ctx.remaining_accounts.iter();
    let mut pairs = vec![];

    for _ in 0..hint {
        let user = next_account_info(accounts_to_merge)?;
        let player_account = next_account_info(accounts_to_merge)?;

        pairs.push((user, player_account));
    }

    let mut player_infos = vec![];
    // We check that:
    // 1. `player_account` is a valid PlayerInfo acccount.
    // 2. `user's` signature is present for this instruction.
    // 3. `user` is the valid user for that playerinfo account.
    // 4. `player_account` hasn't been "merged" before.
    for (user, player_account) in pairs {
        let mut deserialized = Account::<'a, PlayerInfo>::try_from(player_account)?;
        require!(user.is_signer, CrateError::MissingSignature);
        require_keys_eq!(deserialized.user, user.key());
        require_keys_eq!(deserialized.merged, Pubkey::default());
        deserialized.merged = merge_account.key();

        player_infos.push(deserialized);
    }

    require_keys_eq!(active_player_info.merged, Pubkey::default());
    player_infos.push(active_player_info.clone());

    let keys: Vec<Pubkey> = player_infos
        .iter()
        .map(|info| info.key())
        .collect::<HashSet<_>>()
        .into_iter()
        .collect();

    let size = Merged::size(keys.len());
    create_account(
        size,
        &merge_account,
        &active_user,
        system_program,
    )?;

    let mut merge_account = Account::<'_, Merged>::try_from(merge_account)?;
    merge_account.keys = keys;

    Ok(())
}
