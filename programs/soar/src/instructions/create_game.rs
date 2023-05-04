use crate::state::*;
use crate::InitializeGame;
use anchor_lang::prelude::*;

pub fn handler(
    ctx: Context<InitializeGame>,
    game_meta_input: GameMeta,
    game_auth_input: Vec<Pubkey>,
    leaderboard_input: RegisterLeaderBoardInput,
) -> Result<()> {
    game_meta_input.check_field_lengths()?;
    leaderboard_input.check_field_lengths()?;

    let game_account = &mut ctx.accounts.game;

    let initial_leaderboard_id: u64 = 1;
    ctx.accounts
        .leaderboard
        .set_inner(leaderboard_input.into_leaderboard(game_account.key(), initial_leaderboard_id));

    let mut game_object = Game::default();

    game_object.set_meta(game_meta_input);
    game_object.leaderboard = initial_leaderboard_id;
    game_object.auth = game_auth_input;

    game_account.set_inner(game_object);

    Ok(())
}
