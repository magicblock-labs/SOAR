use crate::state::{PlayerEntryList, ScoreEntry};
use crate::utils::resize_account;
use crate::SubmitScore;
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<SubmitScore>, score: u64) -> Result<()> {
    let player_entries = &mut ctx.accounts.player_entries;

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
    Ok(())
}
