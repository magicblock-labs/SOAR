use crate::{error::SoarError, state::RewardKind, utils, ClaimReward};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer};

pub fn handler(ctx: Context<ClaimReward>) -> Result<()> {
    let user = &ctx.accounts.user;
    let token_program = &ctx.accounts.token_program;
    let player_achievement = &mut ctx.accounts.player_achievement;

    let reward_account = &mut ctx.accounts.reward;
    if reward_account.available == 0 {
        return Err(SoarError::NoAvailableRewards.into());
    }
    if !player_achievement.claimed {
        return Err(SoarError::FullyClaimedReward.into());
    }
    let achievement_account = &ctx.accounts.achievement;

    let game_key = &ctx.accounts.game.key();
    let achievement_bump = *ctx.bumps.get("achievement").unwrap();
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
        RewardKind::FungibleToken { mint: _, account } => {
            let user_token_account = &ctx.accounts.user_token_account;
            let source_token_account = &ctx.accounts.source_token_account;
            if user_token_account.is_none() || source_token_account.is_none() {
                return Err(SoarError::MissingRequiredAccountsForFtReward.into());
            }

            let user_token_account = user_token_account.as_ref().unwrap();
            require_keys_eq!(user_token_account.owner, user.key());
            let source_token_account = source_token_account.as_ref().unwrap();
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

            token::transfer(cpi_ctx, reward_account.amount_per_user)?;
            player_achievement.claimed = true;
            player_achievement.claims = reward_account.amount_per_user;
        }
        RewardKind::NonFungibleToken {
            uri,
            name,
            symbol,
            minted,
            collection,
        } => {
            let payer = &ctx.accounts.payer;
            let mint = &ctx.accounts.nft_reward_mint;
            let metadata = &ctx.accounts.nft_reward_metadata;
            let master_edition = &ctx.accounts.nft_reward_master_edition;
            let mint_to = &ctx.accounts.nft_reward_mint_to;
            let token_metadata_program = &ctx.accounts.token_metadata_program;
            let associated_token_program = &ctx.accounts.associated_token_program;
            let system_program = &ctx.accounts.system_program;
            let rent = &ctx.accounts.rent;

            if payer.is_none()
                || mint.is_none()
                || metadata.is_none()
                || master_edition.is_none()
                || mint_to.is_none()
                || token_metadata_program.is_none()
                || associated_token_program.is_none()
                || system_program.is_none()
                || rent.is_none()
            {
                return Err(SoarError::MissingRequiredAccountsForNftReward.into());
            }

            let payer = payer.as_ref().unwrap();
            let mint = mint.as_ref().unwrap();
            let metadata = metadata.as_ref().unwrap();
            let master_edition = master_edition.as_ref().unwrap();
            let mint_to = mint_to.as_ref().unwrap();
            let token_metadata_program = token_metadata_program.as_ref().unwrap();
            let associated_token_program = associated_token_program.as_ref().unwrap();
            let system_program = system_program.as_ref().unwrap();
            let rent = rent.as_ref().unwrap();

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
            player_achievement.claims = player_achievement.claims.checked_add(1).unwrap();
            if player_achievement.claims == reward_account.amount_per_user {
                player_achievement.claimed = true;
            }
        }
    }

    reward_account.available = reward_account.available.checked_sub(1).unwrap();
    Ok(())
}
