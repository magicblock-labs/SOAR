use crate::{seeds, utils, VerifyReward};
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<VerifyReward>) -> Result<()> {
    let reward_account = &ctx.accounts.reward;
    let metadata_account = &ctx.accounts.metadata_to_verify;
    let mint = &ctx.accounts.mint;

    let decoded = utils::decode_mpl_metadata_account(metadata_account)?;
    require_keys_eq!(decoded.mint, mint.key());

    let reward_bump = *ctx.bumps.get("reward").unwrap();
    let achievement_key = &ctx.accounts.achievement.key();
    let reward_seeds = &[seeds::REWARD, achievement_key.as_ref(), &[reward_bump]];

    utils::verify_nft(
        &ctx.accounts.metadata_to_verify,
        &ctx.accounts.payer,
        &ctx.accounts.collection_mint,
        &ctx.accounts.collection_metadata,
        &ctx.accounts.collection_master_edition,
        &reward_account.to_account_info(),
        Some(&[&reward_seeds[..]]),
    )?;

    Ok(())
}
