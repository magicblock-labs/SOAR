use crate::{seeds, utils::verify_nft, VerifyReward};
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<VerifyReward>) -> Result<()> {
    let collection_update_authority = &ctx.accounts.reward;
    let reward_bump = *ctx.bumps.get("reward").unwrap();
    let achievement_key = &ctx.accounts.achievement.key();
    let reward_seeds = &[seeds::REWARD, achievement_key.as_ref(), &[reward_bump]];

    verify_nft(
        &ctx.accounts.metadata_to_verify,
        &ctx.accounts.payer,
        &ctx.accounts.collection_mint,
        &ctx.accounts.collection_metadata,
        &ctx.accounts.collection_master_edition,
        &collection_update_authority.to_account_info(),
        Some(&[&reward_seeds[..]]),
    )?;

    Ok(())
}
