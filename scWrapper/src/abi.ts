export const abi = [
  {
    type: 'impl',
    name: 'NebulaVote',
    interface_name: 'nebula_vote::INebulaVote',
  },
  {
    type: 'struct',
    name: 'core::byte_array::ByteArray',
    members: [
      {
        name: 'data',
        type: 'core::array::Array::<core::bytes_31::bytes31>',
      },
      {
        name: 'pending_word',
        type: 'core::felt252',
      },
      {
        name: 'pending_word_len',
        type: 'core::integer::u32',
      },
    ],
  },
  {
    type: 'struct',
    name: 'core::circuit::u384',
    members: [
      {
        name: 'limb0',
        type: 'core::internal::bounded_int::BoundedInt::<0, 79228162514264337593543950335>',
      },
      {
        name: 'limb1',
        type: 'core::internal::bounded_int::BoundedInt::<0, 79228162514264337593543950335>',
      },
      {
        name: 'limb2',
        type: 'core::internal::bounded_int::BoundedInt::<0, 79228162514264337593543950335>',
      },
      {
        name: 'limb3',
        type: 'core::internal::bounded_int::BoundedInt::<0, 79228162514264337593543950335>',
      },
    ],
  },
  {
    type: 'struct',
    name: 'garaga::definitions::G1Point',
    members: [
      {
        name: 'x',
        type: 'core::circuit::u384',
      },
      {
        name: 'y',
        type: 'core::circuit::u384',
      },
    ],
  },
  {
    type: 'struct',
    name: 'core::array::Span::<garaga::definitions::G1Point>',
    members: [
      {
        name: 'snapshot',
        type: '@core::array::Array::<garaga::definitions::G1Point>',
      },
    ],
  },
  {
    type: 'struct',
    name: 'core::array::Span::<core::felt252>',
    members: [
      {
        name: 'snapshot',
        type: '@core::array::Array::<core::felt252>',
      },
    ],
  },
  {
    type: 'struct',
    name: 'core::array::Span::<(core::array::Span::<core::felt252>, core::array::Span::<core::felt252>)>',
    members: [
      {
        name: 'snapshot',
        type: '@core::array::Array::<(core::array::Span::<core::felt252>, core::array::Span::<core::felt252>)>',
      },
    ],
  },
  {
    type: 'enum',
    name: 'core::option::Option::<core::array::Span::<(core::array::Span::<core::felt252>, core::array::Span::<core::felt252>)>>',
    variants: [
      {
        name: 'Some',
        type: 'core::array::Span::<(core::array::Span::<core::felt252>, core::array::Span::<core::felt252>)>',
      },
      {
        name: 'None',
        type: '()',
      },
    ],
  },
  {
    type: 'struct',
    name: 'core::array::Span::<core::circuit::u384>',
    members: [
      {
        name: 'snapshot',
        type: '@core::array::Array::<core::circuit::u384>',
      },
    ],
  },
  {
    type: 'struct',
    name: 'garaga::ec_ops::FunctionFelt',
    members: [
      {
        name: 'a_num',
        type: 'core::array::Span::<core::circuit::u384>',
      },
      {
        name: 'a_den',
        type: 'core::array::Span::<core::circuit::u384>',
      },
      {
        name: 'b_num',
        type: 'core::array::Span::<core::circuit::u384>',
      },
      {
        name: 'b_den',
        type: 'core::array::Span::<core::circuit::u384>',
      },
    ],
  },
  {
    type: 'struct',
    name: 'garaga::ec_ops::MSMHint',
    members: [
      {
        name: 'Q_low',
        type: 'garaga::definitions::G1Point',
      },
      {
        name: 'Q_high',
        type: 'garaga::definitions::G1Point',
      },
      {
        name: 'Q_high_shifted',
        type: 'garaga::definitions::G1Point',
      },
      {
        name: 'SumDlogDivLow',
        type: 'garaga::ec_ops::FunctionFelt',
      },
      {
        name: 'SumDlogDivHigh',
        type: 'garaga::ec_ops::FunctionFelt',
      },
      {
        name: 'SumDlogDivHighShifted',
        type: 'garaga::ec_ops::FunctionFelt',
      },
    ],
  },
  {
    type: 'struct',
    name: 'garaga::ec_ops::DerivePointFromXHint',
    members: [
      {
        name: 'y_last_attempt',
        type: 'core::circuit::u384',
      },
      {
        name: 'g_rhs_sqrt',
        type: 'core::array::Span::<core::circuit::u384>',
      },
    ],
  },
  {
    type: 'struct',
    name: 'core::integer::u256',
    members: [
      {
        name: 'low',
        type: 'core::integer::u128',
      },
      {
        name: 'high',
        type: 'core::integer::u128',
      },
    ],
  },
  {
    type: 'struct',
    name: 'core::array::Span::<core::integer::u256>',
    members: [
      {
        name: 'snapshot',
        type: '@core::array::Array::<core::integer::u256>',
      },
    ],
  },
  {
    type: 'struct',
    name: 'alices_ring_cairo_verifier::structType::GaragaMSMParam',
    members: [
      {
        name: 'scalars_digits_decompositions',
        type: 'core::option::Option::<core::array::Span::<(core::array::Span::<core::felt252>, core::array::Span::<core::felt252>)>>',
      },
      {
        name: 'hint',
        type: 'garaga::ec_ops::MSMHint',
      },
      {
        name: 'derive_point_from_x_hint',
        type: 'garaga::ec_ops::DerivePointFromXHint',
      },
      {
        name: 'points',
        type: 'core::array::Span::<garaga::definitions::G1Point>',
      },
      {
        name: 'scalars',
        type: 'core::array::Span::<core::integer::u256>',
      },
      {
        name: 'curve_index',
        type: 'core::integer::u32',
      },
    ],
  },
  {
    type: 'struct',
    name: 'core::array::Span::<alices_ring_cairo_verifier::structType::GaragaMSMParam>',
    members: [
      {
        name: 'snapshot',
        type: '@core::array::Array::<alices_ring_cairo_verifier::structType::GaragaMSMParam>',
      },
    ],
  },
  {
    type: 'struct',
    name: 'alices_ring_cairo_verifier::structType::RingSignature',
    members: [
      {
        name: 'message_digest',
        type: 'core::circuit::u384',
      },
      {
        name: 'c',
        type: 'core::circuit::u384',
      },
      {
        name: 'ring',
        type: 'core::array::Span::<garaga::definitions::G1Point>',
      },
      {
        name: 'hints',
        type: 'core::array::Span::<alices_ring_cairo_verifier::structType::GaragaMSMParam>',
      },
    ],
  },
  {
    type: 'struct',
    name: 'nebula_vote::Poll',
    members: [
      {
        name: 'title',
        type: 'core::byte_array::ByteArray',
      },
      {
        name: 'expiration_time',
        type: 'core::integer::u64',
      },
      {
        name: 'owner',
        type: 'core::starknet::contract_address::ContractAddress',
      },
      {
        name: 'choice_count',
        type: 'core::felt252',
      },
    ],
  },
  {
    type: 'struct',
    name: 'nebula_vote::Choice',
    members: [
      {
        name: 'id',
        type: 'core::felt252',
      },
      {
        name: 'title',
        type: 'core::byte_array::ByteArray',
      },
      {
        name: 'vote_count',
        type: 'core::integer::u256',
      },
    ],
  },
  {
    type: 'enum',
    name: 'core::bool',
    variants: [
      {
        name: 'False',
        type: '()',
      },
      {
        name: 'True',
        type: '()',
      },
    ],
  },
  {
    type: 'interface',
    name: 'nebula_vote::INebulaVote',
    items: [
      {
        type: 'function',
        name: 'create_poll',
        inputs: [
          {
            name: 'title',
            type: 'core::byte_array::ByteArray',
          },
          {
            name: 'expiration_time',
            type: 'core::integer::u64',
          },
          {
            name: 'choice_titles',
            type: 'core::array::Array::<core::byte_array::ByteArray>',
          },
        ],
        outputs: [
          {
            type: 'core::felt252',
          },
        ],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'add_choice',
        inputs: [
          {
            name: 'poll_id',
            type: 'core::felt252',
          },
          {
            name: 'choice_text',
            type: 'core::byte_array::ByteArray',
          },
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'vote',
        inputs: [
          {
            name: 'poll_id',
            type: 'core::felt252',
          },
          {
            name: 'choice_id',
            type: 'core::felt252',
          },
          {
            name: 'ring_signature',
            type: 'alices_ring_cairo_verifier::structType::RingSignature',
          },
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'get_poll',
        inputs: [
          {
            name: 'poll_id',
            type: 'core::felt252',
          },
        ],
        outputs: [
          {
            type: 'nebula_vote::Poll',
          },
        ],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_poll_state',
        inputs: [
          {
            name: 'poll_id',
            type: 'core::felt252',
          },
        ],
        outputs: [
          {
            type: 'core::array::Array::<nebula_vote::Choice>',
          },
        ],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_choice',
        inputs: [
          {
            name: 'poll_id',
            type: 'core::felt252',
          },
          {
            name: 'choice_id',
            type: 'core::felt252',
          },
        ],
        outputs: [
          {
            type: 'nebula_vote::Choice',
          },
        ],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'is_poll_active',
        inputs: [
          {
            name: 'poll_id',
            type: 'core::felt252',
          },
        ],
        outputs: [
          {
            type: 'core::bool',
          },
        ],
        state_mutability: 'view',
      },
    ],
  },
  {
    type: 'event',
    name: 'nebula_vote::NebulaVote::VoteCast',
    kind: 'struct',
    members: [
      {
        name: 'poll_id',
        type: 'core::felt252',
        kind: 'data',
      },
      {
        name: 'choice',
        type: 'nebula_vote::Choice',
        kind: 'data',
      },
    ],
  },
  {
    type: 'event',
    name: 'nebula_vote::NebulaVote::UnauthorizedAttempt',
    kind: 'struct',
    members: [
      {
        name: 'unauthorized_address',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'data',
      },
    ],
  },
  {
    type: 'event',
    name: 'nebula_vote::NebulaVote::Event',
    kind: 'enum',
    variants: [
      {
        name: 'VoteCast',
        type: 'nebula_vote::NebulaVote::VoteCast',
        kind: 'nested',
      },
      {
        name: 'UnauthorizedAttempt',
        type: 'nebula_vote::NebulaVote::UnauthorizedAttempt',
        kind: 'nested',
      },
    ],
  },
];
