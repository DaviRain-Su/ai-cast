module ai_cast::tipping;

use sui::coin::Coin;
use sui::sui::SUI;
use ai_cast::podcast::Podcast;
use ai_cast::creator::CreatorProfile;

// === 错误码 ===

const EZeroAmount: u64 = 0;
const ECreatorMismatch: u64 = 1;

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

    // 验证 creator_profile 与 podcast 的创作者一致
    assert!(ai_cast::creator::owner(creator_profile) == creator_addr, ECreatorMismatch);

    transfer::public_transfer(payment, creator_addr);

    ai_cast::podcast::add_tips(podcast, amount);
    ai_cast::creator::add_tips(creator_profile, amount);

    sui::event::emit(TipSent {
        tipper: ctx.sender(),
        podcast_id: object::id(podcast),
        creator: creator_addr,
        amount,
    });
}
