use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction, sysvar::rent::Rent};

pub fn create_account<'a>(
    size: usize,
    to_create: &AccountInfo<'a>,
    payer: &AccountInfo<'a>,
    system_program: &AccountInfo<'a>,
) -> Result<()> {
    let lamports = Rent::default().minimum_balance(size);
    let create_ix = system_instruction::create_account(
        payer.key,
        to_create.key,
        lamports,
        size as u64,
        &crate::ID,
    );

    invoke(
        &create_ix,
        &[to_create.clone(), payer.clone(), system_program.clone()],
    )?;

    Ok(())
}

// https://solanacookbook.com/references/programs.html#how-to-change-account-size
pub fn resize_account<'a>(
    target_account: &AccountInfo<'a>,
    funding_account: &AccountInfo<'a>,
    system_program: &AccountInfo<'a>,
    new_size: usize,
) -> Result<()> {
    let rent = Rent::get()?;
    let new_minimum_balance = rent.minimum_balance(new_size);

    let lamports_diff = new_minimum_balance.saturating_sub(target_account.lamports());
    invoke(
        &system_instruction::transfer(funding_account.key, target_account.key, lamports_diff),
        &[
            funding_account.clone(),
            target_account.clone(),
            system_program.clone(),
        ],
    )?;

    target_account.realloc(new_size, false)?;

    Ok(())
}
