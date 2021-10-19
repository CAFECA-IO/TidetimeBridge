class jobListItem {
  /**
   *
   * @param {Object} param
   *
   */
  constructor({
    pk = '',
    srcChainID = '',
    srcTxHash = '',
    destTxHash = '',
    mintOrBurnTxHash = '',
    step = 0,
    finalized = false,
  }) {
    this._pk = pk;
    this._srcChainID = srcChainID;
    this._srcTxHash = srcTxHash;
    this._destTxHash = destTxHash;
    this._mintOrBurnTxHash = mintOrBurnTxHash;
    this._step = step;
    this._finalized = finalized;
  }

  // setter
  set pk(pk) { this._pk = pk; }

  set srcChainID(srcChainID) { this._srcChainID = srcChainID; }

  set srcTxHash(srcTxHash) { this._srcTxHash = srcTxHash; }

  set destTxHash(destTxHash) { this._destTxHash = destTxHash; }

  set mintOrBurnTxHash(mintOrBurnTxHash) { this._mintOrBurnTxHash = mintOrBurnTxHash; }

  set step(step) { this._step = step; }

  set finalized(finalized) { this._finalized = finalized; }

  // getter
  get pk() { return this._pk ? this._pk : `${this.srcChainID}-${this.srcTxHash}`; }

  get srcChainID() { return this._srcChainID; }

  get srcTxHash() { return this._srcTxHash; }

  get destTxHash() { return this._destTxHash; }

  get mintOrBurnTxHash() { return this._mintOrBurnTxHash; }

  get step() { return this._step; }

  get finalized() { return this._finalized; }

  get data() {
    return {
      pk: this.pk,
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
