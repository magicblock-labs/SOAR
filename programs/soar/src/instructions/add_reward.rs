use crate::utils::{decode_mpl_metadata_account, update_metadata_account};
use crate::{state::RegisterNewRewardInput, AddReward};
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<AddReward>, input: RegisterNewRewardInput) -> Result<()> {
    let new_reward = &mut ctx.accounts.new_reward;

    new_reward.achievement = ctx.accounts.achievement.key();
    new_reward.uri = input.uri;
    new_reward.name = input.name;
    new_reward.symbol = input.symbol;
    new_reward.minted = 0;

    let authority = &ctx.accounts.collection_update_auth;
    let mint = &ctx.accounts.collection_mint;
    let meta = &ctx.accounts.collection_metadata;

    if authority.is_some() && mint.is_some() && meta.is_some() {
        let mint = mint.as_ref().unwrap();
        let metadata = meta.as_ref().unwrap();

        let decoded = decode_mpl_metadata_account(metadata)?;
        let mint_key = mint.key();
        require_keys_eq!(decoded.mint, mint_key);

        // Make the newly created `reward` account the update_authority of the collection
        // metadata so that it can sign verification.
        let update_authority = authority.as_ref().unwrap();
        let token_metadata_program = &ctx.accounts.token_metadata_program;

        update_metadata_account(
            None,
            None,
            None,
            None,
            Some(new_reward.key()),
            metadata,
            update_authority,
            token_metadata_program,
            None,
        )?;

        new_reward.collection_mint = Some(mint_key);
    } else {
        new_reward.collection_mint = None;
    }
    new_reward.check_field_lengths()?;

    let achievement = &mut ctx.accounts.achievement;
    achievement.reward = Some(new_reward.key());
    Ok(())
}
