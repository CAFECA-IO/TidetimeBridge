const JOB_STATE = {
  PENDING: 'PENDING',
  DONE: 'DONE',
};

class jobListItem {
  /**
   *
   * @param {Object} param
   *
   */
  constructor({
    pk = '',
    srcChainId = '',
    srcTxHash = '',
    destTxHash = '',
    mintOrBurnTxHash = '',
    step = 0,
    finalized = false,
  }) {
    this._pk = pk;
    this._srcChainId = srcChainId;
    this._srcTxHash = srcTxHash;
    this._destTxHash = destTxHash;
    this._mintOrBurnTxHash = mintOrBurnTxHash;
    this._step = step;
    this._finalized = finalized;
  }

  // setter
  set pk(pk) { this._pk = pk; }

  set srcChainId(srcChainId) { this._srcChainId = srcChainId; }

  set srcTxHash(srcTxHash) { this._srcTxHash = srcTxHash; }

  set destTxHash(destTxHash) { this._destTxHash = destTxHash; }

  set mintOrBurnTxHash(mintOrBurnTxHash) { this._mintOrBurnTxHash = mintOrBurnTxHash; }

  set step(step) { this._step = step; }

  set finalized(finalized) { this._finalized = finalized; }

  // getter
  get pk() {
    let state = JOB_STATE.PENDING;
    if (this.finalized) state = JOB_STATE.DONE;
    return this._pk ? this._pk : `${state}.${this.srcChainId}-${this.srcTxHash}`;
  }

  get srcChainId() { return this._srcChainId; }

  get srcTxHash() { return this._srcTxHash; }

  get destTxHash() { return this._destTxHash; }

  get mintOrBurnTxHash() { return this._mintOrBurnTxHash; }

  get step() { return this._step; }

  get finalized() { return this._finalized; }

  get data() {
    return {
      pk: this.pk,
      srcChainId: this.srcChainId,
      srcTxHash: this.srcTxHash,
      destTxHash: this.destTxHash,
      mintOrBurnTxHash: this.mintOrBurnTxHash,
      step: this._step,
      finalized: this.finalized,
    };
  }

  get check() {
    return (!!this.srcChainId && !!this.srcTxHash);
  }

  get bridgeDetailKey() { return `${this.srcChainId}-${this.srcTxHash}`; }
}

module.exports = { jobListItem, JOB_STATE };
