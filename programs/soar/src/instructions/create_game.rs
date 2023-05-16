use crate::state::*;
use crate::InitializeGame;
use anchor_lang::prelude::*;

pub fn handler(
    ctx: Context<InitializeGame>,
    game_meta_input: GameMeta,
    game_auth_input: Vec<Pubkey>,
) -> Result<()> {
    game_meta_input.check_field_lengths()?;

    let game_account = &mut ctx.accounts.game;
    let mut game_object = Game::default();

    game_object.set_meta(game_meta_input);
    game_object.leaderboard_count = 0;
    game_object.achievement_count = 0;
    game_object.auth = game_auth_input;

    game_account.set_inner(game_object);

    Ok(())
}
