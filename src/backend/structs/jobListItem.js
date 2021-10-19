class jobListItem {
  /**
   *
   * @param {Object} param
   *
   */
  constructor({
    key = '',
    srcChainID = '',
    srcTxHash = '',
    destTxHash = '',
    mintOrBurnTxHash = '',
    step = 0,
    finalized = false,
  }) {
    this._key = key;
    this._srcChainID = srcChainID;
    this._srcTxHash = srcTxHash;
    this._destTxHash = destTxHash;
    this._mintOrBurnTxHash = mintOrBurnTxHash;
    this._step = step;
    this._finalized = finalized;
  }

  // setter
  set key(key) { this._key = key; }

  set srcChainID(srcChainID) { this._srcChainID = srcChainID; }

  set srcTxHash(srcTxHash) { this._srcTxHash = srcTxHash; }

  set destTxHash(destTxHash) { this._destTxHash = destTxHash; }

  set mintOrBurnTxHash(mintOrBurnTxHash) { this._mintOrBurnTxHash = mintOrBurnTxHash; }

  set step(step) { this._step = step; }

  set finalized(finalized) { this._finalized = finalized; }

  // getter
  get key() { return this._key ? this._key : `${this.srcChainID}-${this.srcTxHash}`; }

  get srcChainID() { return this._srcChainID; }

  get srcTxHash() { return this._srcTxHash; }

  get destTxHash() { return this._destTxHash; }

  get mintOrBurnTxHash() { return this._mintOrBurnTxHash; }

  get step() { return this._step; }

  get finalized() { return this._finalized; }

  get data() {
    return {
      key: this.key,
      srcChainID: this.srcChainID,
      srcTxHash: this.srcTxHash,
      destTxHash: this.destTxHash,
      mintOrBurnTxHash: this.mintOrBurnTxHash,
      step: this._step,
      finalized: this.finalized,
    };
  }

  get check() {
    return (!!this.srcChainID && !!this.srcTxHash);
  }
}

module.exports = jobListItem;
