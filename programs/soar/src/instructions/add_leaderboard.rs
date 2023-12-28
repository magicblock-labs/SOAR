use crate::error::SoarError;
use crate::state::{FieldsCheck, LeaderBoardScore, RegisterLeaderBoardInput};
use crate::AddLeaderBoard;
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<AddLeaderBoard>, input: RegisterLeaderBoardInput) -> Result<()> {
    input.check()?;

    let game = &ctx.accounts.game;
    let new_count = game.next_leaderboard();

    let retain_count = input.scores_to_retain;
    let order = input.is_ascending;
    let allow_multiple_scores = input.allow_multiple_scores;

    let leaderboard = input.into();
    ctx.accounts.leaderboard.set_inner(leaderboard);
    ctx.accounts.leaderboard.allow_multiple_scores = allow_multiple_scores;
    ctx.accounts.leaderboard.id = new_count;
    ctx.accounts.leaderboard.game = game.key();
    ctx.accounts.game.leaderboard_count = new_count;

    if retain_count > 0 {
        require!(
            ctx.accounts.top_entries.is_some(),
            SoarError::MissingExpectedAccount
        );
    }

    if retain_count > 0 && ctx.accounts.top_entries.is_some() {
        let top_entries = &mut ctx.accounts.top_entries.as_mut().unwrap();

        top_entries.is_ascending = order;
        top_entries.top_scores = vec![LeaderBoardScore::default(); retain_count as usize];
        ctx.accounts.leaderboard.top_entries = Some(top_entries.key());
    }

    Ok(())
}
