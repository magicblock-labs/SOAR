use crate::state::FieldsCheck;
use crate::UpdatePlayer;
use anchor_lang::prelude::*;

pub fn handler(
    ctx: Context<UpdatePlayer>,
    username: Option<String>,
    nft_metadata: Option<Pubkey>,
) -> Result<()> {
    let player_account = &mut ctx.accounts.player_account;

    if let Some(name) = username {
        player_account.username = name;
    }
    if let Some(meta) = nft_metadata {
        player_account.nft_meta = meta;
    }

    player_account.check()?;
    Ok(())
}
