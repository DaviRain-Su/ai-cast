#[test_only]
module ai_cast::tests;

use std::string;
use sui::test_scenario;
use sui::coin;
use sui::sui::SUI;
use ai_cast::creator;
use ai_cast::podcast;
use ai_cast::subscription;
use ai_cast::tipping;

const CREATOR: address = @0xA;
const LISTENER: address = @0xB;

// === Creator Tests ===

#[test]
fun test_create_profile() {
    let mut scenario = test_scenario::begin(CREATOR);
    {
        let ctx = scenario.ctx();
        let profile = creator::create_profile(
            string::utf8(b"Test Podcast"),
            string::utf8(b"A test bio"),
            ctx,
        );
        assert!(creator::owner(&profile) == CREATOR);
        assert!(creator::subscriber_count(&profile) == 0);
        assert!(creator::total_tips(&profile) == 0);
        transfer::public_transfer(profile, CREATOR);
    };
    scenario.end();
}

#[test]
fun test_update_profile() {
    let mut scenario = test_scenario::begin(CREATOR);
    {
        let ctx = scenario.ctx();
        let profile = creator::create_profile(
            string::utf8(b"Old Name"),
            string::utf8(b"Old Bio"),
            ctx,
        );
        transfer::public_transfer(profile, CREATOR);
    };

    scenario.next_tx(CREATOR);
    {
        let mut profile = scenario.take_from_sender<creator::CreatorProfile>();
        creator::update_profile(
            &mut profile,
            string::utf8(b"New Name"),
            string::utf8(b"New Bio"),
            scenario.ctx(),
        );
        assert!(creator::name(&profile) == &string::utf8(b"New Name"));
        scenario.return_to_sender(profile);
    };
    scenario.end();
}

#[test]
#[expected_failure(abort_code = 0)]
fun test_update_profile_not_owner() {
    let mut scenario = test_scenario::begin(CREATOR);
    {
        let ctx = scenario.ctx();
        let profile = creator::create_profile(
            string::utf8(b"Name"),
            string::utf8(b"Bio"),
            ctx,
        );
        transfer::public_transfer(profile, CREATOR);
    };

    // LISTENER tries to update CREATOR's profile
    scenario.next_tx(LISTENER);
    {
        let mut profile = scenario.take_from_address<creator::CreatorProfile>(CREATOR);
        creator::update_profile(
            &mut profile,
            string::utf8(b"Hacked"),
            string::utf8(b"Hacked"),
            scenario.ctx(),
        );
        test_scenario::return_to_address(CREATOR, profile);
    };
    scenario.end();
}

// === Podcast Tests ===

#[test]
fun test_publish_podcast() {
    let mut scenario = test_scenario::begin(CREATOR);
    {
        let ctx = scenario.ctx();
        let podcast = podcast::publish(
            string::utf8(b"Episode 1"),
            string::utf8(b"Description"),
            string::utf8(b"blob123"),
            option::some(string::utf8(b"script456")),
            option::none(),
            300,
            string::utf8(b"deep_dive"),
            option::some(string::utf8(b"https://example.com")),
            0, // free
            ctx,
        );
        assert!(podcast::creator(&podcast) == CREATOR);
        assert!(podcast::title(&podcast) == &string::utf8(b"Episode 1"));
        assert!(podcast::is_free(&podcast));
        assert!(podcast::tip_total(&podcast) == 0);
        assert!(podcast::play_count(&podcast) == 0);
        transfer::public_transfer(podcast, CREATOR);
    };
    scenario.end();
}

#[test]
fun test_update_podcast() {
    let mut scenario = test_scenario::begin(CREATOR);
    {
        let ctx = scenario.ctx();
        let podcast = podcast::publish(
            string::utf8(b"Old Title"),
            string::utf8(b"Old Desc"),
            string::utf8(b"blob1"),
            option::none(),
            option::none(),
            100,
            string::utf8(b"news"),
            option::none(),
            0,
            ctx,
        );
        transfer::public_transfer(podcast, CREATOR);
    };

    scenario.next_tx(CREATOR);
    {
        let mut pod = scenario.take_from_sender<podcast::Podcast>();
        podcast::update(
            &mut pod,
            string::utf8(b"New Title"),
            string::utf8(b"New Desc"),
            option::some(string::utf8(b"cover789")),
            scenario.ctx(),
        );
        assert!(podcast::title(&pod) == &string::utf8(b"New Title"));
        scenario.return_to_sender(pod);
    };
    scenario.end();
}

#[test]
fun test_delete_podcast() {
    let mut scenario = test_scenario::begin(CREATOR);
    {
        let ctx = scenario.ctx();
        let podcast = podcast::publish(
            string::utf8(b"To Delete"),
            string::utf8(b""),
            string::utf8(b"blob1"),
            option::none(),
            option::none(),
            60,
            string::utf8(b"news"),
            option::none(),
            0,
            ctx,
        );
        transfer::public_transfer(podcast, CREATOR);
    };

    scenario.next_tx(CREATOR);
    {
        let pod = scenario.take_from_sender<podcast::Podcast>();
        podcast::delete(pod, scenario.ctx());
    };
    scenario.end();
}

#[test]
#[expected_failure(abort_code = 1)]
fun test_publish_invalid_tier() {
    let mut scenario = test_scenario::begin(CREATOR);
    {
        let ctx = scenario.ctx();
        let podcast = podcast::publish(
            string::utf8(b"Bad Tier"),
            string::utf8(b""),
            string::utf8(b"blob1"),
            option::none(),
            option::none(),
            60,
            string::utf8(b"news"),
            option::none(),
            99, // invalid tier
            ctx,
        );
        transfer::public_transfer(podcast, CREATOR);
    };
    scenario.end();
}

// === Tipping Tests ===

#[test]
fun test_tip() {
    let mut scenario = test_scenario::begin(CREATOR);
    {
        let ctx = scenario.ctx();
        let profile = creator::create_profile(
            string::utf8(b"Creator"),
            string::utf8(b""),
            ctx,
        );
        transfer::public_transfer(profile, CREATOR);
    };

    scenario.next_tx(CREATOR);
    {
        let ctx = scenario.ctx();
        let podcast = podcast::publish(
            string::utf8(b"EP 1"),
            string::utf8(b""),
            string::utf8(b"blob1"),
            option::none(),
            option::none(),
            300,
            string::utf8(b"deep_dive"),
            option::none(),
            0,
            ctx,
        );
        transfer::public_transfer(podcast, CREATOR);
    };

    // LISTENER tips
    scenario.next_tx(LISTENER);
    {
        let mut pod = scenario.take_from_address<podcast::Podcast>(CREATOR);
        let mut profile = scenario.take_from_address<creator::CreatorProfile>(CREATOR);

        let payment = coin::mint_for_testing<SUI>(1_000_000_000, scenario.ctx());

        tipping::tip(&mut pod, &mut profile, payment, scenario.ctx());

        assert!(podcast::tip_total(&pod) == 1_000_000_000);
        assert!(creator::total_tips(&profile) == 1_000_000_000);

        test_scenario::return_to_address(CREATOR, pod);
        test_scenario::return_to_address(CREATOR, profile);
    };
    scenario.end();
}

#[test]
#[expected_failure(abort_code = 1)] // ECreatorMismatch
fun test_tip_creator_mismatch() {
    let mut scenario = test_scenario::begin(CREATOR);
    {
        let ctx = scenario.ctx();
        let profile = creator::create_profile(string::utf8(b"Creator"), string::utf8(b""), ctx);
        transfer::public_transfer(profile, CREATOR);
    };

    // LISTENER creates a different profile
    scenario.next_tx(LISTENER);
    {
        let ctx = scenario.ctx();
        let profile2 = creator::create_profile(string::utf8(b"Listener"), string::utf8(b""), ctx);
        transfer::public_transfer(profile2, LISTENER);
    };

    scenario.next_tx(CREATOR);
    {
        let ctx = scenario.ctx();
        let podcast = podcast::publish(
            string::utf8(b"EP 1"), string::utf8(b""), string::utf8(b"blob1"),
            option::none(), option::none(), 300, string::utf8(b"deep_dive"), option::none(), 0, ctx,
        );
        transfer::public_transfer(podcast, CREATOR);
    };

    // LISTENER tips but passes wrong profile
    scenario.next_tx(LISTENER);
    {
        let mut pod = scenario.take_from_address<podcast::Podcast>(CREATOR);
        let mut wrong_profile = scenario.take_from_sender<creator::CreatorProfile>(); // Listener's profile

        let payment = coin::mint_for_testing<SUI>(100, scenario.ctx());
        tipping::tip(&mut pod, &mut wrong_profile, payment, scenario.ctx());

        test_scenario::return_to_address(CREATOR, pod);
        scenario.return_to_sender(wrong_profile);
    };
    scenario.end();
}

// === Subscription Tests ===

#[test]
fun test_subscribe_and_cancel() {
    let mut scenario = test_scenario::begin(CREATOR);
    {
        let ctx = scenario.ctx();
        let profile = creator::create_profile(string::utf8(b"Creator"), string::utf8(b""), ctx);
        transfer::public_transfer(profile, CREATOR);
    };

    // LISTENER subscribes
    scenario.next_tx(LISTENER);
    {
        let mut profile = scenario.take_from_address<creator::CreatorProfile>(CREATOR);
        let payment = coin::mint_for_testing<SUI>(500_000_000, scenario.ctx());

        let sub = subscription::subscribe(&mut profile, 10, payment, scenario.ctx());

        assert!(creator::subscriber_count(&profile) == 1);
        assert!(subscription::is_active(&sub, 0));

        transfer::public_transfer(sub, LISTENER);
        test_scenario::return_to_address(CREATOR, profile);
    };

    // LISTENER cancels
    scenario.next_tx(LISTENER);
    {
        let mut sub = scenario.take_from_sender<subscription::Subscription>();
        let mut profile = scenario.take_from_address<creator::CreatorProfile>(CREATOR);

        subscription::cancel(&mut sub, &mut profile, scenario.ctx());

        assert!(creator::subscriber_count(&profile) == 0);
        assert!(!subscription::is_active(&sub, 0));

        scenario.return_to_sender(sub);
        test_scenario::return_to_address(CREATOR, profile);
    };
    scenario.end();
}

#[test]
fun test_renew_expired() {
    let mut scenario = test_scenario::begin(CREATOR);
    {
        let ctx = scenario.ctx();
        let profile = creator::create_profile(string::utf8(b"Creator"), string::utf8(b""), ctx);
        transfer::public_transfer(profile, CREATOR);
    };

    // Subscribe
    scenario.next_tx(LISTENER);
    {
        let mut profile = scenario.take_from_address<creator::CreatorProfile>(CREATOR);
        let payment = coin::mint_for_testing<SUI>(100, scenario.ctx());
        let sub = subscription::subscribe(&mut profile, 1, payment, scenario.ctx());
        transfer::public_transfer(sub, LISTENER);
        test_scenario::return_to_address(CREATOR, profile);
    };

    // Cancel (simulating expiry without actually advancing epoch)
    scenario.next_tx(LISTENER);
    {
        let mut sub = scenario.take_from_sender<subscription::Subscription>();
        let mut profile = scenario.take_from_address<creator::CreatorProfile>(CREATOR);
        subscription::cancel(&mut sub, &mut profile, scenario.ctx());
        assert!(creator::subscriber_count(&profile) == 0);
        scenario.return_to_sender(sub);
        test_scenario::return_to_address(CREATOR, profile);
    };

    // Renew after cancel — should re-increment subscriber count
    scenario.next_tx(LISTENER);
    {
        let mut sub = scenario.take_from_sender<subscription::Subscription>();
        let mut profile = scenario.take_from_address<creator::CreatorProfile>(CREATOR);
        let payment = coin::mint_for_testing<SUI>(100, scenario.ctx());
        subscription::renew(&mut sub, &mut profile, 5, payment, scenario.ctx());
        assert!(creator::subscriber_count(&profile) == 1);
        scenario.return_to_sender(sub);
        test_scenario::return_to_address(CREATOR, profile);
    };
    scenario.end();
}
