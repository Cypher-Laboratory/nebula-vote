use alices_ring_cairo_verifier::structType::RingSignature;
use core::byte_array::ByteArray;


struct Choice {
    title: ByteArray,
    vote_count: u256
}

trait IPoll<TContractState> {
    fn create_poll(ref self: TContractState, title: ByteArray, expiration_time: u64) -> felt252;
    fn add_choice(ref self: TContractState, poll_id: felt252, choice_text: ByteArray);
    fn vote(ref self: TContractState, poll_id: felt252, ring_signature: RingSignature);
    fn get_poll(self: @TContractState, poll_id: felt252) -> Array<Choice>;
    fn get_poll_state(self: @TContractState, poll_id: felt252) -> Array<Choice>;
    fn get_choice(self: @TContractState, poll_id: felt252, choice_index: u32) -> Choice;
    fn is_poll_active(self: @TContractState, poll_id: felt252) -> bool;
}

#[starknet::contract]
mod PollContract {
    use starknet::storage::StoragePathEntry;
    use core::byte_array::ByteArray;
    use core::traits::Into;
    use core::array::SpanTrait;

    use core::starknet::get_caller_address;
    use alices_ring_cairo_verifier::structType::RingSignature;
    use alices_ring_cairo_verifier::verify;
    use starknet::{ContractAddress, get_block_timestamp};
    use starknet::storage::Map;
    use core::poseidon::poseidon_hash_span;

    #[storage]
    struct Storage {
        next_poll_id: felt252,
        polls: Map::<felt252, Poll>,
        choices: Map::<(felt252, felt252), Choice>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        VoteCast: VoteCast,
        UnauthorizedAttempt: UnauthorizedAttempt,
    }

    #[derive(Drop, starknet::Event)]
    struct UnauthorizedAttempt {
        unauthorized_address: ContractAddress,
    }

    #[derive(Drop, Serde, starknet::Store, starknet::Event)]
    struct Choice {
        id: felt252,
        title: ByteArray,
        vote_count: u256
    }

    #[derive(Drop, Serde, starknet::Store)]
    struct Poll {
        title: ByteArray,
        expiration_time: u64,
        owner: ContractAddress,
        choice_count: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct VoteCast {
        poll_id: felt252,
        choice: Choice
    }

    fn create_poll(
        ref self: ContractState,
        title: ByteArray,
        expiration_time: u64,
        choice_titles: Array<ByteArray>
    ) -> felt252 {
        let poll_id = self.next_poll_id.read();
        let span = choice_titles.span();

        let new_poll = Poll {
            title: title,
            expiration_time: expiration_time,
            owner: get_caller_address(),
            choice_count: span.len().into(),
        };

        self.polls.entry(poll_id).write(new_poll);

        let mut i: u32 = 0;
        while i < span.len() {
            let choice = Choice { id: i.into(), title: span[i].clone(), vote_count: 0 };

            self.choices.entry((poll_id, i.into())).write(choice);
            i += 1;
        };

        self.next_poll_id.write(poll_id + 1);
        poll_id
    }

    fn add_choice(ref self: ContractState, poll_id: felt252, choice_text: ByteArray) {
        let mut poll = self.polls.entry(poll_id).read();
        assert(get_caller_address() == poll.owner, 'Only owner can add choices');

        let new_choice = Choice { id: poll.choice_count, title: choice_text, vote_count: 0, };

        self.choices.entry((poll_id, poll.choice_count)).write(new_choice);

        poll.choice_count += 1;
        self.polls.entry(poll_id).write(poll);
    }

    fn get_poll(self: @ContractState, poll_id: felt252) -> Poll {
        self.polls.entry(poll_id).read()
    }

    fn get_poll_state(self: @ContractState, poll_id: felt252) -> Array<Choice> {
        self.polls.entry(poll_id).read();

        let mut choices = ArrayTrait::new();
        let mut choice_index: felt252 = 0;

        loop {
            let choice = self.choices.entry((poll_id, choice_index)).read();
            if choice.title.len() == 0 {
                break;
            }

            choices
                .append(
                    Choice { title: choice.title, id: choice.id, vote_count: choice.vote_count }
                );
            choice_index += 1;
        };

        choices
    }

    fn vote(
        ref self: ContractState, poll_id: felt252, choice_id: felt252, ring_signature: RingSignature
    ) {
        assert(
            poseidon_hash_span(array![choice_id].span()).into() == ring_signature.message_digest,
            'Wrong message digest'
        );

        let poll = self.polls.entry(poll_id).read();
        let current_time = get_block_timestamp();
        assert(current_time < poll.expiration_time, 'Poll has expired');

        let is_valid = verify(ring_signature);
        assert(is_valid, 'Invalid ring signature');

        let mut choice = self.choices.entry((poll_id, choice_id)).read();
        choice.vote_count += 1;
        self.choices.entry((poll_id, choice_id)).write(choice);

        self
            .emit(
                Event::VoteCast(
                    VoteCast {
                        poll_id: poll_id, choice: self.choices.entry((poll_id, choice_id)).read()
                    }
                )
            );
    }

    fn get_choice(self: @ContractState, poll_id: felt252, choice_id: felt252) -> Choice {
        self.choices.entry((poll_id, choice_id)).read()
    }

    fn is_poll_active(self: @ContractState, poll_id: felt252) -> bool {
        let poll = self.polls.entry(poll_id).read();
        let current_time = get_block_timestamp();
        current_time < poll.expiration_time
    }
}
