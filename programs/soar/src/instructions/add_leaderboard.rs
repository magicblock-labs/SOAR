use crate::state::RegisterLeaderBoardInput;
use crate::AddLeaderBoard;
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<AddLeaderBoard>, input: RegisterLeaderBoardInput) -> Result<()> {
    input.check_field_lengths()?;

    let game = &ctx.accounts.game;
    let id = crate::next_leaderboard_id(game);

    let leaderboard = input.into_leaderboard(game.key(), id);

    ctx.accounts.leaderboard.set_inner(leaderboard);
    ctx.accounts.game.leaderboard = id;

    Ok(())
}
