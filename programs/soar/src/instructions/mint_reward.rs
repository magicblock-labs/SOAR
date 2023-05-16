use crate::utils::{create_master_edition_account, create_metadata_account};
use crate::utils::{create_mint, create_token_account, mint_token};
use crate::MintReward;
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<MintReward>) -> Result<()> {
    let payer = &ctx.accounts.payer;
    let mint = &ctx.accounts.mint;
    let system_program = &ctx.accounts.system_program.to_account_info();
    let token_program = &ctx.accounts.token_program.to_account_info();
    let rent = &ctx.accounts.rent.to_account_info();

    // We make the active signer the mint authority. This is only temporary since authority
    // will end up being transferred to the master-edition pda.
    let mint_authority = &ctx.accounts.authority.to_account_info();

    create_mint(
        payer,
        mint,
        mint_authority,
        system_program,
        token_program,
        rent,
    )?;

    let user_token_account = &ctx.accounts.mint_nft_to;
    create_token_account(
        payer,
        user_token_account,
        &ctx.accounts.user,
        &ctx.accounts.mint,
        &ctx.accounts.system_program,
        &ctx.accounts.token_program,
        &ctx.accounts.associated_token_program,
    )?;

    mint_token(
        mint,
        user_token_account,
        mint_authority,
        token_program,
        None,
    )?;

    let reward = &mut ctx.accounts.reward;
    let metadata = &ctx.accounts.metadata;
    let token_metadata_program = &ctx.accounts.token_metadata_program;

    let update_authority = reward.to_account_info();
    let creator = Some(reward.key());
    let collection_mint = reward.collection_mint;

    create_metadata_account(
        &reward.name,
        &reward.symbol,
        &reward.uri,
        metadata,
        mint,
        mint_authority,
        payer,
        &update_authority,
        &creator,
        &collection_mint,
        token_metadata_program,
        system_program,
        &rent.to_account_info(),
        None,
    )?;

    let master_edition = &ctx.accounts.master_edition;
    create_master_edition_account(
        master_edition,
        mint,
        payer,
        metadata,
        mint_authority,
        &update_authority.to_account_info(),
        token_metadata_program,
        system_program,
        &ctx.accounts.rent.to_account_info(),
        None,
    )?;

    reward.minted = reward.minted.checked_add(1).unwrap();
    Ok(())
}
