module ai_cast::subscription;

use sui::coin::Coin;
use sui::sui::SUI;
use ai_cast::creator::CreatorProfile;

// === 错误码 ===

const EZeroPayment: u64 = 0;
const ENotSubscriber: u64 = 1;
const EAlreadyActive: u64 = 2;

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
/// duration_epochs: 订阅时长（以 epoch 为单位）
public fun subscribe(
    creator_profile: &mut CreatorProfile,
    duration_epochs: u64,
    payment: Coin<SUI>,
    ctx: &mut TxContext,
): Subscription {
    let amount = payment.value();
    assert!(amount > 0, EZeroPayment);

    let creator_addr = ai_cast::creator::owner(creator_profile);

    // 将付款转给创作者
    transfer::public_transfer(payment, creator_addr);

    // 更新创作者订阅者计数
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
    transfer::public_transfer(payment, creator_addr);

    let current_epoch = ctx.epoch();

    // 如果已过期，从当前 epoch 重新开始
    if (sub.end_epoch < current_epoch) {
        sub.start_epoch = current_epoch;
        sub.end_epoch = current_epoch + duration_epochs;
        sub.active = true;
        // 重新激活时增加订阅者计数
        ai_cast::creator::increment_subscribers(creator_profile);
    } else {
        // 未过期，延长结束时间
        sub.end_epoch = sub.end_epoch + duration_epochs;
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
    assert!(sub.active, EAlreadyActive);

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
