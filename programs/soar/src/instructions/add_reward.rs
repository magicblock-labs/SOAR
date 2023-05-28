use crate::{
    error::SoarError,
    state::{AddNewRewardInput, RewardKind, RewardKindInput},
    utils, FieldsCheck,
};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Approve};

pub mod ft {
    use super::*;
    use crate::AddFtReward;

    pub fn handler(ctx: Context<AddFtReward>, input: AddNewRewardInput) -> Result<()> {
        let new_reward = &mut ctx.accounts.new_reward;
        new_reward.achievement = ctx.accounts.achievement.key();
        new_reward.available = input.available_rewards;
        new_reward.amount_per_user = input.amount_per_user;

        let achievement = &ctx.accounts.achievement;

        match input.kind {
            RewardKindInput::Ft { deposit } => {
                let mint = &ctx.accounts.reward_token_mint;
                let token_account = &ctx.accounts.delegate_from_token_account;
                let token_account_owner = &ctx.accounts.token_account_owner;
                let token_program = &ctx.accounts.token_program;

                let reward = RewardKind::FungibleToken {
                    mint: mint.key(),
                    account: token_account.key(),
                };
                new_reward.reward = reward;
                new_reward.check()?;

                // Delegate authority to spend some amount of tokens to the `achievement` PDA.
                let cpi_ctx = CpiContext::new(
                    token_program.to_account_info(),
                    Approve {
                        to: token_account.to_account_info(),
                        delegate: achievement.to_account_info(),
                        authority: token_account_owner.to_account_info(),
                    },
                );
                token::approve(cpi_ctx, deposit)?;

                let achievement = &mut ctx.accounts.achievement;
                achievement.reward = Some(new_reward.key());

                Ok(())
            }
            RewardKindInput::Nft {
                uri: _,
                name: _,
                symbol: _,
            } => Err(SoarError::MissingRequiredAccountsForNftReward.into()),
        }
    }
}

pub mod nft {
    use super::*;
    use crate::AddNftReward;

    pub fn handler(ctx: Context<AddNftReward>, input: AddNewRewardInput) -> Result<()> {
        let new_reward = &mut ctx.accounts.new_reward;
        new_reward.achievement = ctx.accounts.achievement.key();
        new_reward.available = input.available_rewards;
        new_reward.amount_per_user = input.amount_per_user;

        let achievement = &ctx.accounts.achievement;

        match input.kind {
            RewardKindInput::Nft { uri, name, symbol } => {
                let mut nft_reward_collection_mint: Option<Pubkey> = None;

                if let Some(collection_mint) = ctx.accounts.reward_collection_mint.as_ref() {
                    let update_auth = ctx
                        .accounts
                        .collection_update_auth
                        .as_ref()
                        .ok_or(SoarError::MissingExpectedAccount)?;
                    let collection_metadata = ctx
                        .accounts
                        .collection_metadata
                        .as_ref()
                        .ok_or(SoarError::MissingExpectedAccount)?;
                    let token_metadata_program = ctx
                        .accounts
                        .token_metadata_program
                        .as_ref()
                        .ok_or(SoarError::MissingExpectedAccount)?;

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
                new_reward.check()?;

                let achievement = &mut ctx.accounts.achievement;
                achievement.reward = Some(new_reward.key());

                Ok(())
            }
            RewardKindInput::Ft { deposit: _ } => {
                Err(SoarError::MissingRequiredAccountsForFtReward.into())
            }
        }
    }
}
