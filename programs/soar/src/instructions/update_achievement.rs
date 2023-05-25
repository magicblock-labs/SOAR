use crate::state::FieldsCheck;
use crate::UpdateAchievement;
use anchor_lang::prelude::*;

pub fn handler(
    ctx: Context<UpdateAchievement>,
    new_title: Option<String>,
    new_description: Option<String>,
    new_meta: Option<Pubkey>,
) -> Result<()> {
    let achievement = &mut ctx.accounts.achievement;

    if let Some(title) = new_title {
        achievement.title = title;
    }
    if let Some(description) = new_description {
        achievement.description = description;
    }
    if let Some(meta) = new_meta {
        achievement.nft_meta = meta;
    }

    achievement.check()?;
    Ok(())
}
