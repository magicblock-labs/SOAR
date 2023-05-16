use crate::error::SoarError;
use crate::state::{LeaderBoardScore, PlayerEntryList, ScoreEntry};
use crate::utils::resize_account;
use crate::SubmitScore;
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<SubmitScore>, score: u64) -> Result<()> {
    let player_entries = &mut ctx.accounts.player_entries;
    let leaderboard = &ctx.accounts.leaderboard;

    if score < leaderboard.min_score || score > leaderboard.max_score {
        return Err(SoarError::ScoreNotWithinBounds.into());
    }

    let clock = Clock::get().unwrap();
    let entry = ScoreEntry::new(score, clock.unix_timestamp);

    let count = player_entries.score_count;
    msg!("score_count is {}", count);
    msg!("scores_vec length is {}", player_entries.scores.len());
    let capacity = player_entries.scores.capacity();
    msg!("scores_vec capacity is {}", capacity);

    if count as usize == capacity {
        let size_without_vec = PlayerEntryList::SIZE_WITHOUT_VEC;
        let vec_size = 4_usize
            .checked_add(capacity.checked_mul(ScoreEntry::SIZE).unwrap())
            .unwrap();

        let to_add = PlayerEntryList::REALLOC_WINDOW
            .checked_mul(ScoreEntry::SIZE)
            .unwrap();

        let new_size = size_without_vec
            .checked_add(vec_size)
            .unwrap()
            .checked_add(to_add)
            .unwrap();

        resize_account(
            &player_entries.to_account_info(),
            &ctx.accounts.user.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            new_size,
        )?;
    }

    player_entries.scores.push(entry);
    player_entries.score_count = count.checked_add(1).unwrap();

    let user_key = ctx.accounts.user.key();

    if let Some(top_entries) = &mut ctx.accounts.top_entries {
        require_keys_eq!(leaderboard.top_entries.unwrap(), top_entries.key());
        let top_scores_entry = LeaderBoardScore::new(user_key, entry);
        let is_ascending = top_entries.is_ascending;
        let last_index = top_entries.top_scores.len() - 1;

        let scores = &mut top_entries.top_scores;
        if is_ascending && entry.score > scores[0].entry.score {
            scores[0] = top_scores_entry;
            scores.sort_by(|a, b| a.entry.score.cmp(&b.entry.score));
        } else if !is_ascending && entry.score > scores[last_index].entry.score {
            scores[last_index - 1] = top_scores_entry;
            scores.sort_by(|a, b| b.entry.score.cmp(&a.entry.score));
        }
    }

    Ok(())
}
