class bridgeDetail {
  /**
   *
   * @param {Object} param
   *
   */
  constructor({
    pk = '',
    srcChainID = '',
    srcTokenAddress = '',
    destChainID = '',
    destTokenAddress = '',
    amount = '',
    srcAddress = '',
    destAddress = '',
    srcTxHash = '',
    destTxHash = '',
    mintOrBurnTxHash = '',
    receivedTimestamp = Date.now(),
    finalized = false,
  }) {
    this._pk = pk;
    this._srcChainID = srcChainID;
    this._srcTokenAddress = srcTokenAddress;
    this._destChainID = destChainID;
    this._destTokenAddress = destTokenAddress;
    this._amount = amount;
    this._srcAddress = srcAddress;
    this._destAddress = destAddress;
    this._srcTxHash = srcTxHash;
    this._destTxHash = destTxHash;
    this._mintOrBurnTxHash = mintOrBurnTxHash;
    this._receivedTimestamp = receivedTimestamp;
    this._finalized = finalized;
  }

  // setter
  set pk(pk) { this._pk = pk; }

  set srcChainID(srcChainID) { this._srcChainID = srcChainID; }

  set srcTokenAddress(srcTokenAddress) { this._srcTokenAddress = srcTokenAddress; }

  set destChainID(destChainID) { this._destChainID = destChainID; }

  set destTokenAddress(destTokenAddress) { this._destTokenAddress = destTokenAddress; }

  set amount(amount) { this._amount = amount; }

  set srcAddress(srcAddress) { this._srcAddress = srcAddress; }

  set destAddress(destAddress) { this._destAddress = destAddress; }

  set srcTxHash(srcTxHash) { this._srcTxHash = srcTxHash; }

  set destTxHash(destTxHash) { this._destTxHash = destTxHash; }

  set mintOrBurnTxHash(mintOrBurnTxHash) { this._mintOrBurnTxHash = mintOrBurnTxHash; }

  set receivedTimestamp(receivedTimestamp) { this._receivedTimestamp = receivedTimestamp; }

  set finalized(finalized) { this._finalized = finalized; }

  // getter
  get pk() { return this._pk ? this._pk : `${this.srcChainID}-${this.srcTxHash}`; }

  get srcChainID() { return this._srcChainID; }

  get srcTokenAddress() { return this._srcTokenAddress; }

  get destChainID() { return this._destChainID; }

  get destTokenAddress() { return this._destTokenAddress; }

  get amount() { return this._amount; }

  get srcAddress() { return this._srcAddress; }

  get destAddress() { return this._destAddress; }

  get srcTxHash() { return this._srcTxHash; }

  get destTxHash() { return this._destTxHash; }

  get mintOrBurnTxHash() { return this._mintOrBurnTxHash; }

  get receivedTimestamp() { return this._receivedTimestamp; }

  get finalized() { return this._finalized; }

  get data() {
    return {
      pk: this.pk,
      srcChainID: this.srcChainID,
      srcTokenAddress: this.srcTokenAddress,
      destChainID: this.destChainID,
      destTokenAddress: this.destTokenAddress,
      amount: this.amount,
      srcAddress: this.srcAddress,
      destAddress: this.destAddress,
      srcTxHash: this.srcTxHash,
      destTxHash: this.destTxHash,
      mintOrBurnTxHash: this.mintOrBurnTxHash,
      receivedTimestamp: this.receivedTimestamp,
      finalized: this.finalized,
    };
  }

  get check() {
    return (!!this.srcChainID && !!this.srcTxHash);
  }
}

module.exports = bridgeDetail;
