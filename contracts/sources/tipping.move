module ai_cast::tipping;

use sui::coin::Coin;
use sui::sui::SUI;
use ai_cast::podcast::Podcast;
use ai_cast::creator::CreatorProfile;

// === 错误码 ===

const EZeroAmount: u64 = 0;

/// 打赏事件
public struct TipSent has copy, drop {
    tipper: address,
    podcast_id: ID,
    creator: address,
    amount: u64,
}

/// 给播客打赏 — SUI 直接转给创作者
public fun tip(
    podcast: &mut Podcast,
    creator_profile: &mut CreatorProfile,
    payment: Coin<SUI>,
    ctx: &mut TxContext,
) {
    let amount = payment.value();
    assert!(amount > 0, EZeroAmount);

    let creator_addr = podcast.creator();

    // 转账给创作者
    transfer::public_transfer(payment, creator_addr);

    // 更新播客和创作者的打赏总额
    ai_cast::podcast::add_tips(podcast, amount);
    ai_cast::creator::add_tips(creator_profile, amount);

    // 发出事件
    sui::event::emit(TipSent {
        tipper: ctx.sender(),
        podcast_id: object::id(podcast),
        creator: creator_addr,
        amount,
    });
}
