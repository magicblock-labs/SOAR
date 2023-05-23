use crate::state::{LeaderBoardScore, RegisterLeaderBoardInput};
use crate::AddLeaderBoard;
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<AddLeaderBoard>, input: RegisterLeaderBoardInput) -> Result<()> {
    input.check_field_lengths()?;

    let game = &ctx.accounts.game;
    let new_count = crate::next_leaderboard(game);

    let retain_count = input.scores_to_retain;
    let order = input.scores_order;

    let leaderboard = input.into_leaderboard(game.key(), new_count);
    ctx.accounts.leaderboard.set_inner(leaderboard);
    ctx.accounts.game.leaderboard_count = new_count;

    if retain_count > 0 && ctx.accounts.top_entries.is_some() {
        let top_entries = &mut ctx.accounts.top_entries.as_mut().unwrap();

        top_entries.is_ascending = order;
        top_entries.top_scores = vec![LeaderBoardScore::default(); retain_count as usize];
        ctx.accounts.leaderboard.top_entries = Some(top_entries.key());
    }

    Ok(())
}
