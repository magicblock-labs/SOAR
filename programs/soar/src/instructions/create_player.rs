use crate::{
    state::{FieldsCheck, Player},
    NewPlayer,
};
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<NewPlayer>, username: String, nft_meta: Pubkey) -> Result<()> {
    let user = &ctx.accounts.user.key();
    let player = Player::new(username, nft_meta, *user);
    player.check()?;

    ctx.accounts.player_account.set_inner(player);
    Ok(())
}
