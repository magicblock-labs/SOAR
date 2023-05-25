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
    game.achievement_count = game.next_achievement();
    let obj = Achievement::new(
        game.key(),
        title,
        description,
        nft_meta,
        game.achievement_count,
    );

    obj.check_field_lengths()?;
    ctx.accounts.new_achievement.set_inner(obj);
    Ok(())
}
