use crate::{
    error::SoarError,
    state::{PlayerAchievement, RewardKind},
    utils,
};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer};

pub mod ft {
    use super::*;
    use crate::ClaimFtReward;

    pub fn handler(ctx: Context<ClaimFtReward>) -> Result<()> {
        let token_program = &ctx.accounts.token_program;
        let player_achievement = &mut ctx.accounts.player_achievement;

        let reward_account = &mut ctx.accounts.reward;
        let achievement_account = &ctx.accounts.achievement;

        let game_key = &ctx.accounts.game.key();
        let achievement_bump = ctx.bumps.achievement;
        let id = ctx.accounts.achievement.id;
        let achievement_seeds = &[
            crate::seeds::ACHIEVEMENT,
            game_key.as_ref(),
            &id.to_le_bytes(),
            &[achievement_bump],
        ];
        let signer = &[&achievement_seeds[..]];

        let reward = &mut reward_account.reward;
        match reward {
            RewardKind::FungibleToken {
                mint: _,
                account,
                amount,
            } => {
                let user_token_account = &ctx.accounts.user_token_account;
                let source_token_account = &ctx.accounts.source_token_account;
                require_keys_eq!(source_token_account.key(), *account);

                let cpi_ctx = CpiContext::new_with_signer(
                    token_program.to_account_info(),
                    Transfer {
                        from: source_token_account.to_account_info(),
                        to: user_token_account.to_account_info(),
                        authority: achievement_account.to_account_info(),
                    },
                    signer,
                );

                token::transfer(cpi_ctx, *amount)?;

                player_achievement.set_inner(PlayerAchievement::new(
                    ctx.accounts.player_account.key(),
                    ctx.accounts.achievement.key(),
                    Clock::get().unwrap().unix_timestamp,
                ));
                player_achievement.claimed = true;

                reward_account.available_spots =
                    reward_account.available_spots.checked_sub(1).unwrap();
                Ok(())
            }
            RewardKind::NonFungibleToken {
                uri: _,
                name: _,
                symbol: _,
                minted: _,
                collection: _,
            } => Err(SoarError::InvalidRewardKind.into()),
        }
    }
}

pub mod nft {
    use super::*;
    use crate::ClaimNftReward;

    pub fn handler(ctx: Context<ClaimNftReward>) -> Result<()> {
        let user = &ctx.accounts.user;
        let token_program = &ctx.accounts.token_program;
        let player_achievement = &mut ctx.accounts.player_achievement;

        let reward_account = &mut ctx.accounts.reward;
        let achievement_account = &ctx.accounts.achievement;

        let game_key = &ctx.accounts.game.key();
        let achievement_bump = ctx.bumps.achievement;
        let id = ctx.accounts.achievement.id;
        let achievement_seeds = &[
            crate::seeds::ACHIEVEMENT,
            game_key.as_ref(),
            &id.to_le_bytes(),
            &[achievement_bump],
        ];
        let signer = &[&achievement_seeds[..]];

        let reward = &mut reward_account.reward;
        match reward {
            RewardKind::NonFungibleToken {
                uri,
                name,
                symbol,
                minted,
                collection,
            } => {
                let payer = &ctx.accounts.payer;
                let mint = &ctx.accounts.new_mint;
                let metadata = &ctx.accounts.new_metadata;
                let master_edition = &ctx.accounts.new_master_edition;
                let mint_to = &ctx.accounts.mint_to;
                let token_metadata_program = &ctx.accounts.token_metadata_program;
                let associated_token_program = &ctx.accounts.associated_token_program;
                let system_program = &ctx.accounts.system_program;
                let rent = &ctx.accounts.rent;

                // Mint authority ends up being transferred to the master edition account.
                let temp_mint_authority = &payer.to_account_info();

                utils::create_mint(
                    payer,
                    mint,
                    temp_mint_authority,
                    system_program,
                    token_program,
                    &rent.to_account_info(),
                )?;

                let user_token_account = mint_to;
                utils::create_token_account(
                    payer,
                    user_token_account,
                    user,
                    mint,
                    system_program,
                    token_program,
                    associated_token_program,
                )?;

                utils::mint_token(
                    mint,
                    user_token_account,
                    temp_mint_authority,
                    token_program,
                    None,
                )?;

                let update_authority = achievement_account.to_account_info();
                let creator = Some(achievement_account.key());

                utils::create_metadata_account(
                    name,
                    symbol,
                    uri,
                    metadata,
                    mint,
                    temp_mint_authority,
                    payer,
                    &update_authority,
                    &creator,
                    collection,
                    token_metadata_program,
                    system_program,
                    &rent.to_account_info(),
                    Some(signer),
                )?;

                utils::create_master_edition_account(
                    master_edition,
                    mint,
                    payer,
                    metadata,
                    temp_mint_authority,
                    &update_authority,
                    token_metadata_program,
                    system_program,
                    &rent.to_account_info(),
                    Some(signer),
                )?;

                *minted = minted.checked_add(1).unwrap();

                player_achievement.set_inner(PlayerAchievement::new(
                    ctx.accounts.player_account.key(),
                    ctx.accounts.achievement.key(),
                    Clock::get().unwrap().unix_timestamp,
                ));
                player_achievement.claimed = true;

                reward_account.available_spots =
                    reward_account.available_spots.checked_sub(1).unwrap();
                Ok(())
            }
            RewardKind::FungibleToken {
                mint: _,
                account: _,
                amount: _,
            } => Err(SoarError::InvalidRewardKind.into()),
        }
    }
}
