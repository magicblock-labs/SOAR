use crate::state::PlayerInfo;
use crate::RegisterPlayer;
use anchor_lang::prelude::*;

pub fn handler(
    ctx: Context<RegisterPlayer>,
    id: u64,
    username: String,
    nft_meta: Pubkey,
) -> Result<()> {
    let player = PlayerInfo::new(id, username, 0, nft_meta);
    player.check_field_lengths()?;

    ctx.accounts.player_account.set_inner(player);
    Ok(())
}
