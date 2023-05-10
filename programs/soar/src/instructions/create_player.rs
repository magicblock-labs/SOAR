use crate::state::Player;
use crate::NewPlayer;
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<NewPlayer>, username: String, nft_meta: Pubkey) -> Result<()> {
    let user = &ctx.accounts.user.key();
    let player = Player::new(username, nft_meta, *user);
    player.check_field_lengths()?;

    ctx.accounts.player_info.set_inner(player);
    Ok(())
}
