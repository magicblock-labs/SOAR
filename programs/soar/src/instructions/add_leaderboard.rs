use crate::state::RegisterLeaderBoardInput;
use crate::AddLeaderBoard;
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<AddLeaderBoard>, input: RegisterLeaderBoardInput) -> Result<()> {
    input.check_field_lengths()?;

    let id = crate::next_leaderboard_id(&ctx.accounts.game);
    let leaderboard = input.into_leaderboard(id);

    ctx.accounts.leaderboard.set_inner(leaderboard);
    ctx.accounts.game.current_leaderboard = id;

    Ok(())
}
