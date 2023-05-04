use crate::state::*;
use crate::InitializeGame;
use anchor_lang::prelude::*;

pub fn handler(
    ctx: Context<InitializeGame>,
    _id: String,
    game_meta_input: GameMeta,
    game_auth_input: Vec<Pubkey>,
    leaderboard_input: RegisterLeaderBoardInput,
) -> Result<()> {
    game_meta_input.check_field_lengths()?;
    leaderboard_input.check_field_lengths()?;

    ctx.accounts
        .leaderboard
        .set_inner(leaderboard_input.into_leaderboard(0));

    let game_account_ref = &mut ctx.accounts.game;
    let mut game_object = Game::default();

    game_object.set_meta(game_meta_input);
    game_object.set_auth(game_auth_input);

    game_account_ref.set_inner(game_object);

    Ok(())
}
