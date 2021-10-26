class SupportChain {
  // name to chain id
  static get bitcoin_mainnet() { return '80000000'; }

  static get bitcoin_testnet() { return 'F0000000'; }

  static get ethereum_mainnet() { return '8000003C'; }

  static get ethereum_ropsten() { return 'F000003C'; }

  static get tidetime() { return '80001F51'; }

  // chain id to name
  static get '80000000'() { return 'bitcoin_mainnet'; }

  static get 'F0000000'() { return 'bitcoin_testnet'; }

  static get '8000003C'() { return 'ethereum_mainnet'; }

  static get 'F000003C'() { return 'ethereum_ropsten'; }

  static get '80001F51'() { return 'tidetime'; }
}

module.exports = SupportChain;
