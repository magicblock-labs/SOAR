use anchor_lang::prelude::*;
use crate::UpdateLeaderBoard;

pub fn handler(ctx: Context<UpdateLeaderBoard>, new_description: Option<String>, new_nft_meta: Option<Pubkey>) -> Result<()> {
    let leaderboard = &mut ctx.accounts.leaderboard;

    if let Some(description) = new_description {
        leaderboard.description = description;
    }
    if let Some(nft_meta) = new_nft_meta {
        leaderboard.nft_meta = nft_meta;
    }
    leaderboard.check_field_lengths()?;

    Ok(())
}