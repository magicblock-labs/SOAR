use crate::state::Achievement;
use crate::AddAchievement;
use anchor_lang::prelude::*;

pub fn handler(
    ctx: Context<AddAchievement>,
    title: String,
    description: String,
    nft_meta: Pubkey,
) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let obj = Achievement::new(game.key(), title, description, nft_meta);

    obj.check_field_lengths()?;
    ctx.accounts.new_achievement.set_inner(obj);
    game.achievement_count = crate::next_achievement(game);

    Ok(())
}
