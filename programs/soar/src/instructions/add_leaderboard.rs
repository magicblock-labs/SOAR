use crate::{
    seeds,
    state::{LeaderBoardScore, LeaderTopEntries, RegisterLeaderBoardInput},
    utils::create_account,
    AddLeaderBoard,
};
use anchor_lang::{prelude::*, Discriminator};

pub fn handler(ctx: Context<AddLeaderBoard>, input: RegisterLeaderBoardInput) -> Result<()> {
    input.check_field_lengths()?;

    let game = &ctx.accounts.game;
    let new_count = crate::next_leaderboard(game);

    let retain_count = input.scores_to_retain;
    let order = input.scores_order;

    let leaderboard = input.into_leaderboard(game.key(), new_count);
    ctx.accounts.leaderboard.set_inner(leaderboard);

    if retain_count > 0 {
        // Create a new `LeaderTopEntries` account.
        let top_entries = &mut ctx.accounts.top_entries;
        let payer = &ctx.accounts.payer;
        let system_program = &ctx.accounts.system_program;

        let leaderboard_key = &ctx.accounts.leaderboard.key();
        let new_bump = *ctx.bumps.get("top_entries").unwrap();

        let size = LeaderTopEntries::size(retain_count as usize);
        let seeds = &[
            seeds::LEADER_TOP_ENTRIES,
            leaderboard_key.as_ref(),
            &[new_bump],
        ];
        create_account(
            size,
            top_entries,
            payer,
            system_program,
            Some(&[&seeds[..]]),
        )?;

        // Serialize account disciminator.
        let discriminator = LeaderTopEntries::discriminator();
        discriminator.serialize(&mut &mut top_entries.data.borrow_mut()[..8])?;

        let mut entries_account = Account::<'_, LeaderTopEntries>::try_from(top_entries)?;
        entries_account.is_ascending = order;
        entries_account.top_scores = vec![LeaderBoardScore::default(); retain_count as usize];
        entries_account.serialize(&mut &mut top_entries.data.borrow_mut()[8..])?;
        msg!("top_scores: {:?}", entries_account.top_scores);

        ctx.accounts.leaderboard.top_entries = Some(top_entries.key());
    }

    ctx.accounts.game.leaderboard_count = new_count;
    Ok(())
}
