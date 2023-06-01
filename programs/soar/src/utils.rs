use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program::{invoke, invoke_signed},
    system_instruction,
    sysvar::rent::Rent,
};
use anchor_spl::token;
use mpl_token_metadata::instruction::{create_master_edition_v3, create_metadata_accounts_v3};
use mpl_token_metadata::state::{DataV2, Metadata, TokenMetadataAccount};

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

pub fn decode_mpl_metadata_account(account: &AccountInfo<'_>) -> Result<Metadata> {
    if account.owner != &mpl_token_metadata::ID {
        return Err(ProgramError::IllegalOwner.into());
    }
    Ok(TokenMetadataAccount::from_account_info(&account.to_account_info()).unwrap())
}

pub fn create_mint<'a>(
    payer: &AccountInfo<'a>,
    mint: &AccountInfo<'a>,
    mint_authority: &AccountInfo<'a>,
    system_program: &AccountInfo<'a>,
    token_program: &AccountInfo<'a>,
    rent_sysvar: &AccountInfo<'a>,
) -> Result<()> {
    let rent = Rent::get()?;
    let lamports = rent.minimum_balance(token::Mint::LEN);
    invoke(
        &system_instruction::create_account(
            payer.key,
            mint.key,
            lamports,
            token::Mint::LEN as u64,
            token_program.key,
        ),
        &[
            payer.clone(),
            mint.clone(),
            system_program.to_account_info().clone(),
        ],
    )?;

    let accounts = token::InitializeMint {
        mint: mint.clone(),
        rent: rent_sysvar.clone(),
    };
    let cpi_ctx = CpiContext::new(token_program.to_account_info(), accounts);
    token::initialize_mint(cpi_ctx, 0, mint_authority.key, Some(mint_authority.key))
}

pub fn mint_token<'a>(
    mint: &AccountInfo<'a>,
    token_account: &AccountInfo<'a>,
    mint_authority: &AccountInfo<'a>,
    token_program: &AccountInfo<'a>,
    signer_seeds: Option<&[&[&[u8]]]>,
) -> Result<()> {
    let mint_to = token::MintTo {
        mint: mint.to_account_info(),
        to: token_account.to_account_info(),
        authority: mint_authority.to_account_info(),
    };

    let cpi_ctx = if let Some(signature) = signer_seeds {
        CpiContext::new_with_signer(token_program.to_account_info(), mint_to, signature)
    } else {
        CpiContext::new(token_program.to_account_info(), mint_to)
    };

    token::mint_to(cpi_ctx, 1)?;
    Ok(())
}

pub fn create_token_account<'a>(
    payer: &AccountInfo<'a>,
    token_account: &AccountInfo<'a>,
    token_account_owner: &AccountInfo<'a>,
    mint: &AccountInfo<'a>,
    system_program: &AccountInfo<'a>,
    token_program: &AccountInfo<'a>,
    associated_token_program: &AccountInfo<'a>,
) -> Result<()> {
    anchor_spl::associated_token::create(CpiContext::new(
        associated_token_program.to_account_info(),
        anchor_spl::associated_token::Create {
            payer: payer.to_account_info(),
            associated_token: token_account.to_account_info(),
            authority: token_account_owner.to_account_info(),
            mint: mint.to_account_info(),
            system_program: system_program.to_account_info(),
            token_program: token_program.to_account_info(),
        },
    ))?;

    Ok(())
}

#[allow(clippy::too_many_arguments)]
pub fn create_metadata_account<'a>(
    name: &str,
    symbol: &str,
    uri: &str,
    metadata_account: &AccountInfo<'a>,
    mint: &AccountInfo<'a>,
    mint_authority: &AccountInfo<'a>,
    payer: &AccountInfo<'a>,
    update_authority: &AccountInfo<'a>,
    creator: &Option<Pubkey>,
    collection_mint: &Option<Pubkey>,
    token_metadata_program: &AccountInfo<'a>,
    system_program: &AccountInfo<'a>,
    rent: &AccountInfo<'a>,
    signer: Option<&[&[&[u8]]]>,
) -> Result<()> {
    let creators = creator.map(|key| {
        vec![mpl_token_metadata::state::Creator {
            address: key,
            verified: true,
            share: 100,
        }]
    });
    let collection = collection_mint.map(|key| mpl_token_metadata::state::Collection {
        verified: false,
        key,
    });

    let instruction = create_metadata_accounts_v3(
        token_metadata_program.key(),
        metadata_account.key(),
        mint.key(),
        mint_authority.key(),
        payer.key(),
        update_authority.key(),
        name.into(),
        symbol.into(),
        uri.into(),
        creators,
        1,
        true,
        true,
        collection,
        None,
        None,
    );
    let accounts = [
        metadata_account.clone(),
        mint.clone(),
        mint_authority.clone(),
        payer.clone(),
        update_authority.clone(),
        system_program.to_account_info().clone(),
        rent.clone(),
    ];

    if let Some(signature) = signer {
        invoke_signed(&instruction, &accounts, signature)?;
    } else {
        invoke(&instruction, &accounts)?;
    }

    Ok(())
}

#[allow(clippy::too_many_arguments)]
pub fn create_master_edition_account<'a>(
    master_edition: &AccountInfo<'a>,
    mint: &AccountInfo<'a>,
    payer: &AccountInfo<'a>,
    metadata: &AccountInfo<'a>,
    mint_authority: &AccountInfo<'a>,
    metadata_update_authority: &AccountInfo<'a>,
    token_metadata_program: &AccountInfo<'a>,
    system_program: &AccountInfo<'a>,
    rent: &AccountInfo<'a>,
    signer: Option<&[&[&[u8]]]>,
) -> Result<()> {
    let instruction = create_master_edition_v3(
        token_metadata_program.key(),
        master_edition.key(),
        mint.key(),
        metadata_update_authority.key(),
        mint_authority.key(),
        metadata.key(),
        payer.key(),
        Some(0),
    );
    let accounts = [
        metadata_update_authority.clone(),
        master_edition.clone(),
        mint.clone(),
        payer.clone(),
        metadata.clone(),
        system_program.to_account_info(),
        rent.clone(),
    ];

    if let Some(signature) = signer {
        invoke_signed(&instruction, &accounts, signature)?;
    } else {
        invoke(&instruction, &accounts)?;
    }

    Ok(())
}

#[allow(clippy::too_many_arguments)]
pub fn update_metadata_account<'a>(
    new_name: Option<String>,
    new_symbol: Option<String>,
    new_uri: Option<String>,
    new_collection: Option<Pubkey>,
    new_update_authority: Option<Pubkey>,
    metadata: &AccountInfo<'a>,
    update_authority: &AccountInfo<'a>,
    token_metadata_program: &AccountInfo<'a>,
    signer_seeds: Option<&[&[&[u8]]]>,
) -> Result<()> {
    let state: Metadata = TokenMetadataAccount::from_account_info(&metadata.to_account_info())?;
    let initial = state.data;

    let new_collection = new_collection.map(|key| mpl_token_metadata::state::Collection {
        verified: false,
        key,
    });

    let collection = if new_collection.is_some() {
        new_collection
    } else {
        state.collection
    };

    let new_data = DataV2 {
        name: new_name.unwrap_or(initial.name),
        symbol: new_symbol.unwrap_or(initial.symbol),
        uri: new_uri.unwrap_or(initial.uri),
        seller_fee_basis_points: initial.seller_fee_basis_points,
        creators: initial.creators,
        collection,
        uses: None,
    };

    let instruction = mpl_token_metadata::instruction::update_metadata_accounts_v2(
        mpl_token_metadata::ID,
        *metadata.key,
        *update_authority.key,
        new_update_authority,
        Some(new_data),
        None,
        None,
    );

    let accounts = [
        token_metadata_program.clone(),
        metadata.clone(),
        update_authority.clone(),
    ];

    if let Some(signature) = signer_seeds {
        invoke_signed(&instruction, &accounts, signature)?;
    } else {
        invoke(&instruction, &accounts)?;
    }

    Ok(())
}

#[allow(clippy::too_many_arguments)]
pub fn verify_nft<'a>(
    unverified_metadata: &AccountInfo<'a>,
    payer: &AccountInfo<'a>,
    collection_mint: &AccountInfo<'a>,
    collection_metadata: &AccountInfo<'a>,
    collection_master_edition: &AccountInfo<'a>,
    collection_update_authority: &AccountInfo<'a>,
    token_metadata_program: &AccountInfo<'a>,
    signer: Option<&[&[&[u8]]]>,
) -> Result<()> {
    let instruction = mpl_token_metadata::instruction::verify_sized_collection_item(
        mpl_token_metadata::ID,
        *unverified_metadata.key,
        *collection_update_authority.key,
        *payer.key,
        *collection_mint.key,
        *collection_metadata.key,
        *collection_master_edition.key,
        None,
    );
    let accounts = [
        token_metadata_program.clone(),
        unverified_metadata.clone(),
        collection_update_authority.clone(),
        payer.clone(),
        collection_mint.clone(),
        collection_metadata.clone(),
        collection_master_edition.clone(),
    ];

    if let Some(signature) = signer {
        invoke_signed(&instruction, &accounts, signature)?;
    } else {
        invoke(&instruction, &accounts)?;
    }

    Ok(())
}
