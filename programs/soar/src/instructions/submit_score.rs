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

    let count = player_entries.scores.len();
    if count == player_entries.alloc_count as usize {
        let window = PlayerEntryList::REALLOC_WINDOW;
        msg!(
            "count: {}. Reallocating space for {} entries",
            count,
            window
        );

        let size = player_entries.current_size();
        let to_add = window.checked_mul(ScoreEntry::SIZE).unwrap();
        let new_size = size.checked_add(to_add).unwrap();

        resize_account(
            &player_entries.to_account_info(),
            &ctx.accounts.payer.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            new_size,
        )?;
        player_entries.alloc_count = player_entries
            .alloc_count
            .checked_add(PlayerEntryList::REALLOC_WINDOW as u16)
            .unwrap();

        let new_space = player_entries.to_account_info().data_len();
        msg!(
            "Resized account with initial space {}. New space: {}.",
            size,
            new_space
        );
    }

    player_entries.scores.push(entry);
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
