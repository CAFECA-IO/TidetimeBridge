class bridgeDetail {
  /**
   *
   * @param {Object} param
   *
   */
  constructor({
    pk = '',
    id = '',
    srcChainId = '',
    srcTokenAddress = '',
    destChainId = '',
    destTokenAddress = '',
    name = 0,
    symbol = 0,
    decimals = 0,
    amount = '',
    srcAddress = '',
    destAddress = '',
    srcTxHash = '',
    destTxHash = '',
    mintOrBurnTxHash = '',
    receivedTimestamp = Date.now(),
    finalized = false,
    triggerData = '',
  }) {
    this._pk = pk;
    this._id = id;
    this._srcChainId = srcChainId;
    this._srcTokenAddress = srcTokenAddress;
    this._destChainId = destChainId;
    this._destTokenAddress = destTokenAddress;
    this._amount = amount;
    this._name = name;
    this._symbol = symbol;
    this._decimals = decimals;
    this._srcAddress = srcAddress;
    this._destAddress = destAddress;
    this._srcTxHash = srcTxHash;
    this._destTxHash = destTxHash;
    this._mintOrBurnTxHash = mintOrBurnTxHash;
    this._receivedTimestamp = receivedTimestamp;
    this._finalized = finalized;
    this._triggerData = triggerData;
  }

  // setter
  set pk(pk) { this._pk = pk; }

  set id(id) { this._id = id; }

  set srcChainId(srcChainId) { this._srcChainId = srcChainId; }

  set srcTokenAddress(srcTokenAddress) { this._srcTokenAddress = srcTokenAddress; }

  set destChainId(destChainId) { this._destChainId = destChainId; }

  set destTokenAddress(destTokenAddress) { this._destTokenAddress = destTokenAddress; }

  set amount(amount) { this._amount = amount; }

  set name(name) { this._name = name; }

  set symbol(symbol) { this._symbol = symbol; }

  set decimals(decimals) { this._decimals = decimals; }

  set srcAddress(srcAddress) { this._srcAddress = srcAddress; }

  set destAddress(destAddress) { this._destAddress = destAddress; }

  set srcTxHash(srcTxHash) { this._srcTxHash = srcTxHash; }

  set destTxHash(destTxHash) { this._destTxHash = destTxHash; }

  set mintOrBurnTxHash(mintOrBurnTxHash) { this._mintOrBurnTxHash = mintOrBurnTxHash; }

  set receivedTimestamp(receivedTimestamp) { this._receivedTimestamp = receivedTimestamp; }

  set finalized(finalized) { this._finalized = finalized; }

  set triggerData(triggerData) { this._triggerData = triggerData; }

  // getter
  get pk() { return this._pk ? this._pk : `${this.srcChainId}-${this.srcTxHash}`; }

  get id() { return this._id; }

  get srcChainId() { return this._srcChainId; }

  get srcTokenAddress() { return this._srcTokenAddress; }

  get destChainId() { return this._destChainId; }

  get destTokenAddress() { return this._destTokenAddress; }

  get amount() { return this._amount; }

  get name() { return this._name; }

  get symbol() { return this._symbol; }

  get decimals() { return this._decimals; }

  get srcAddress() { return this._srcAddress; }

  get destAddress() { return this._destAddress; }

  get srcTxHash() { return this._srcTxHash; }

  get destTxHash() { return this._destTxHash; }

  get mintOrBurnTxHash() { return this._mintOrBurnTxHash; }

  get receivedTimestamp() { return this._receivedTimestamp; }

  get finalized() { return this._finalized; }

  get triggerData() { return this._triggerData; }

  get data() {
    return {
      pk: this.pk,
      id: this.id,
      srcChainId: this.srcChainId,
      srcTokenAddress: this.srcTokenAddress,
      destChainId: this.destChainId,
      destTokenAddress: this.destTokenAddress,
      amount: this.amount,
      name: this.name,
      symbol: this.symbol,
      decimals: this.decimals,
      srcAddress: this.srcAddress,
      destAddress: this.destAddress,
      srcTxHash: this.srcTxHash,
      destTxHash: this.destTxHash,
      mintOrBurnTxHash: this.mintOrBurnTxHash,
      receivedTimestamp: this.receivedTimestamp,
      finalized: this.finalized,
      triggerData: this.triggerData,
    };
  }

  get check() {
    return (!!this.srcChainId && !!this.srcTxHash);
  }
}

module.exports = bridgeDetail;
