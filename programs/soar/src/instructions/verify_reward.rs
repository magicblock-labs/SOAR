use crate::{seeds, utils, VerifyNftReward};
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<VerifyNftReward>) -> Result<()> {
    let achievement_account = &ctx.accounts.achievement;
    let metadata_account = &ctx.accounts.metadata_to_verify;
    let mint = &ctx.accounts.mint;

    let decoded = utils::decode_mpl_metadata_account(metadata_account)?;
    require_keys_eq!(decoded.mint, mint.key());

    let game_key = &ctx.accounts.game.key();
    let achievement_bump = ctx.bumps.achievement;
    let id = ctx.accounts.achievement.id;
    let achievement_seeds = &[
        seeds::ACHIEVEMENT,
        game_key.as_ref(),
        &id.to_le_bytes(),
        &[achievement_bump],
    ];

    utils::verify_nft(
        &ctx.accounts.metadata_to_verify,
        &ctx.accounts.payer,
        &ctx.accounts.collection_mint,
        &ctx.accounts.collection_metadata,
        &ctx.accounts.collection_edition,
        &achievement_account.to_account_info(),
        &ctx.accounts.token_metadata_program,
        Some(&[&achievement_seeds[..]]),
    )?;

    Ok(())
}
