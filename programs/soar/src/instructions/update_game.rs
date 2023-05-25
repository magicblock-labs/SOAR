use crate::{
    state::{FieldsCheck, Game, GameAttributes},
    utils, UpdateGame,
};
use anchor_lang::prelude::*;

pub fn handler(
    ctx: Context<UpdateGame>,
    new_attributes: Option<GameAttributes>,
    new_auth: Option<Vec<Pubkey>>,
) -> Result<()> {
    let game_account = &mut ctx.accounts.game;

    if let Some(attr) = new_attributes {
        attr.check()?;
        game_account.set_attributes(attr);
    }

    if let Some(new_auth) = new_auth {
        let initial_auth_len = game_account.auth.len();
        let prev_size = Game::size(initial_auth_len);

        let new_size = prev_size
            .checked_sub(initial_auth_len * 32)
            .unwrap()
            .checked_add(new_auth.len() * 32)
            .unwrap();

        utils::resize_account(
            &game_account.to_account_info(),
            &ctx.accounts.payer.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            new_size,
        )?;

        game_account.auth = new_auth;
    };

    Ok(())
}
