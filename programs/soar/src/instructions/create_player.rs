use anchor_lang::prelude::*;
use crate::{
    state::{FieldsCheck, Player},
    InitializePlayer,
};

pub fn handler(ctx: Context<InitializePlayer>, username: String, nft_meta: Pubkey) -> Result<()> {
    let user = &ctx.accounts.user.key();
    let player = Player::new(username, nft_meta, *user);
    player.check()?;

    ctx.accounts.player_account.set_inner(player);
    Ok(())
}
