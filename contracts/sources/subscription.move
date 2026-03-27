module ai_cast::subscription;

use sui::coin::Coin;
use sui::sui::SUI;
use ai_cast::creator::CreatorProfile;

// === 错误码 ===

const EZeroPayment: u64 = 0;
const ENotSubscriber: u64 = 1;
const ENotActive: u64 = 2;
const ECreatorMismatch: u64 = 3;

/// 订阅对象 — 属于订阅者
public struct Subscription has key, store {
    id: UID,
    subscriber: address,
    creator: address,
    amount_paid: u64,
    start_epoch: u64,
    end_epoch: u64,
    active: bool,
}

/// 订阅事件
public struct SubscriptionCreated has copy, drop {
    subscriber: address,
    creator: address,
    duration_epochs: u64,
    amount: u64,
}

/// 取消订阅事件
public struct SubscriptionCancelled has copy, drop {
    subscriber: address,
    creator: address,
}

/// 订阅某个创作者
public fun subscribe(
    creator_profile: &mut CreatorProfile,
    duration_epochs: u64,
    payment: Coin<SUI>,
    ctx: &mut TxContext,
): Subscription {
    let amount = payment.value();
    assert!(amount > 0, EZeroPayment);

    let creator_addr = ai_cast::creator::owner(creator_profile);

    transfer::public_transfer(payment, creator_addr);
    ai_cast::creator::increment_subscribers(creator_profile);

    let current_epoch = ctx.epoch();

    sui::event::emit(SubscriptionCreated {
        subscriber: ctx.sender(),
        creator: creator_addr,
        duration_epochs,
        amount,
    });

    Subscription {
        id: object::new(ctx),
        subscriber: ctx.sender(),
        creator: creator_addr,
        amount_paid: amount,
        start_epoch: current_epoch,
        end_epoch: current_epoch + duration_epochs,
        active: true,
    }
}

/// 续费订阅
public fun renew(
    sub: &mut Subscription,
    creator_profile: &mut CreatorProfile,
    duration_epochs: u64,
    payment: Coin<SUI>,
    ctx: &mut TxContext,
) {
    let amount = payment.value();
    assert!(amount > 0, EZeroPayment);

    let creator_addr = ai_cast::creator::owner(creator_profile);
    // 验证 creator_profile 与订阅的创作者一致
    assert!(sub.creator == creator_addr, ECreatorMismatch);

    transfer::public_transfer(payment, creator_addr);

    let current_epoch = ctx.epoch();

    if (sub.end_epoch < current_epoch) {
        // 已过期 — 重新开始
        sub.start_epoch = current_epoch;
        sub.end_epoch = current_epoch + duration_epochs;
    } else {
        // 未过期 — 延长
        sub.end_epoch = sub.end_epoch + duration_epochs;
    };

    // 如果之前已取消，重新激活并计数
    if (!sub.active) {
        sub.active = true;
        ai_cast::creator::increment_subscribers(creator_profile);
    };

    sub.amount_paid = sub.amount_paid + amount;
}

/// 取消订阅
public fun cancel(
    sub: &mut Subscription,
    creator_profile: &mut CreatorProfile,
    ctx: &TxContext,
) {
    assert!(sub.subscriber == ctx.sender(), ENotSubscriber);
    assert!(sub.active, ENotActive);

    // 验证 creator_profile 与订阅的创作者一致
    assert!(sub.creator == ai_cast::creator::owner(creator_profile), ECreatorMismatch);

    sub.active = false;
    ai_cast::creator::decrement_subscribers(creator_profile);

    sui::event::emit(SubscriptionCancelled {
        subscriber: sub.subscriber,
        creator: sub.creator,
    });
}

/// 检查订阅是否活跃
public fun is_active(sub: &Subscription, current_epoch: u64): bool {
    sub.active && current_epoch <= sub.end_epoch
}

// === 查询函数 ===

public fun subscriber(sub: &Subscription): address { sub.subscriber }
public fun creator(sub: &Subscription): address { sub.creator }
public fun end_epoch(sub: &Subscription): u64 { sub.end_epoch }
public fun amount_paid(sub: &Subscription): u64 { sub.amount_paid }
