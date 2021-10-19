const START_KEY = 'START_KEY';

class jobListItem {
  /**
   *
   * @param {Object} param
   *
   */
  constructor({
    key = '',
    prevKey = '',
    nextKey = '',
    retry = 0,
    finalized = false,
  }) {
    this._key = key;
    this._prevKey = prevKey;
    this._nextKey = nextKey;
    this._retry = retry;
    this._finalized = finalized;
  }

  // setter
  set key(key) { this._key = key; }

  set prevKey(prevKey) { this._prevKey = prevKey; }

  set nextKey(nextKey) { this._nextKey = nextKey; }

  set retry(retry) { this._retry = retry; }

  set finalized(finalized) { this._finalized = finalized; }

  // getter
  get key() { return `${this._key}`; }

  get prevKey() { return this._prevKey; }

  get nextKey() { return this._nextKey; }

  get retry() { return this._retry; }

  get finalized() { return this._finalized; }

  get data() {
    return {
      key: this.key,
      prevKey: this.prevKey,
      nextKey: this.nextKey,
      retry: this.retry,
      finalized: this.finalized,
    };
  }

  get check() {
    return (!!this.key && !!this.prevKey && !!this.nextKey);
  }
}

module.exports = { jobListItem, START_KEY };
