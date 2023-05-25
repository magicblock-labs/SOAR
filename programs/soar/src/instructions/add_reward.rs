use crate::{
    error::SoarError,
    state::{AddNewRewardInput, RewardKind, RewardKindInput},
    utils, AddReward, FieldsCheck,
};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Approve};

pub fn handler(ctx: Context<AddReward>, input: AddNewRewardInput) -> Result<()> {
    let new_reward = &mut ctx.accounts.new_reward;
    new_reward.achievement = ctx.accounts.achievement.key();
    new_reward.available = input.available_rewards;
    new_reward.amount_per_user = input.amount_per_user;

    let achievement = &ctx.accounts.achievement;

    match input.kind {
        RewardKindInput::Ft { deposit, mint: _ } => {
            let mint = &ctx.accounts.ft_reward_token_mint;
            let token_account = &ctx.accounts.ft_reward_delegate_account;
            let token_account_owner = &ctx.accounts.ft_reward_delegate_account_owner;
            let token_program = &ctx.accounts.token_program;

            if mint.is_none()
                || token_account.is_none()
                || token_account_owner.is_none()
                || token_program.is_none()
            {
                return Err(SoarError::MissingRequiredAccountsForFtReward.into());
            }
            let mint = mint.as_ref().unwrap();
            let token_account = token_account.as_ref().unwrap();
            let token_account_owner = token_account_owner.as_ref().unwrap();
            let token_program = token_program.as_ref().unwrap();

            require_keys_eq!(mint.key(), token_account.mint);

            // We delegate authority to spend some amount of tokens to the newly created `reward` PDA.
            let cpi_ctx = CpiContext::new(
                token_program.to_account_info(),
                Approve {
                    to: token_account.to_account_info(),
                    delegate: achievement.to_account_info(),
                    authority: token_account_owner.to_account_info(),
                },
            );
            token::approve(cpi_ctx, deposit)?;

            let reward = RewardKind::FungibleToken {
                mint: mint.key(),
                account: token_account.key(),
            };
            new_reward.reward = reward;
        }
        RewardKindInput::Nft { uri, name, symbol } => {
            let update_authority = &ctx.accounts.nft_reward_collection_update_auth;
            let collection_mint = &ctx.accounts.nft_reward_collection_mint;
            let collection_metadata = &ctx.accounts.nft_reward_collection_metadata;
            let metadata_program = &ctx.accounts.token_metadata_program;

            let mut nft_reward_collection_mint: Option<Pubkey> = None;

            if update_authority.is_some()
                && collection_mint.is_some()
                && collection_metadata.is_some()
                && metadata_program.is_some()
            {
                let update_auth = update_authority.as_ref().unwrap();
                let collection_mint = collection_mint.as_ref().unwrap();
                let collection_metadata = collection_metadata.as_ref().unwrap();
                let token_metadata_program = metadata_program.as_ref().unwrap();

                let decoded = utils::decode_mpl_metadata_account(collection_metadata)?;
                let mint_key = collection_mint.key();
                require_keys_eq!(decoded.mint, mint_key);

                // Make the newly created `reward` account the update_authority of the collection
                // metadata so that it can sign verification.
                utils::update_metadata_account(
                    None,
                    None,
                    None,
                    None,
                    Some(achievement.key()),
                    collection_metadata,
                    update_auth,
                    token_metadata_program,
                    None,
                )?;
                nft_reward_collection_mint = Some(collection_mint.key());
            }

            let reward = RewardKind::NonFungibleToken {
                uri,
                name,
                symbol,
                minted: 0,
                collection: nft_reward_collection_mint,
            };

            new_reward.reward = reward;
        }
    }
    new_reward.check()?;

    let achievement = &mut ctx.accounts.achievement;
    achievement.reward = Some(new_reward.key());
    Ok(())
}
