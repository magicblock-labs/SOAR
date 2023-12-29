use crate::state::FieldsCheck;
use crate::UpdateLeaderBoard;
use anchor_lang::prelude::*;

pub fn handler(
    ctx: Context<UpdateLeaderBoard>,
    new_description: Option<String>,
    new_nft_meta: Option<Pubkey>,
    new_min_score: Option<u64>,
    new_max_score: Option<u64>,
    new_is_ascending: Option<bool>,
    new_allow_multiple_scores: Option<bool>,
) -> Result<()> {
    let leaderboard = &mut ctx.accounts.leaderboard;

    if let Some(description) = new_description {
        leaderboard.description = description;
    }
    if let Some(nft_meta) = new_nft_meta {
        leaderboard.nft_meta = nft_meta;
    }
    if let Some(max_score) = new_max_score {
        leaderboard.max_score = max_score;
    }
    if let Some(min_score) = new_min_score {
        leaderboard.min_score = min_score;
    }
    if let Some(is_ascending) = new_is_ascending {
        let top_entries = &mut ctx.accounts.top_entries;
        if let Some(top_entries) = top_entries {
            top_entries.is_ascending = is_ascending;
        }
    }
    if let Some(allow_multiple_scores) = new_allow_multiple_scores {
        leaderboard.allow_multiple_scores = allow_multiple_scores;
    }
    leaderboard.check()?;

    Ok(())
}
