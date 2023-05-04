use crate::state::*;
use crate::utils::resize_account;
use crate::UpdateGame;
use anchor_lang::prelude::*;

pub fn handler(
    ctx: Context<UpdateGame>,
    new_meta: Option<GameMeta>,
    new_auth: Option<Vec<Pubkey>>,
) -> Result<()> {
    let game_account = &mut ctx.accounts.game;

    if let Some(meta) = new_meta {
        meta.check_field_lengths()?;
        game_account.set_meta(meta);
    }

    if let Some(new_auth) = new_auth {
        let initial_auth_len = game_account.auth.len();
        let prev_size = Game::size_with_auths(initial_auth_len);

        let new_size = prev_size
            .checked_sub(initial_auth_len * 32)
            .unwrap()
            .checked_add(new_auth.len() * 32)
            .unwrap();

        resize_account(
            &game_account.to_account_info(),
            &ctx.accounts.payer.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            new_size,
        )?;

        game_account.auth = new_auth;
    };

    Ok(())
}
