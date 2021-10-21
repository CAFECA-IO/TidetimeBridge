// Transaction Data Struct for TideWalletJs
class Transaction {
  constructor({
    accountId = '',
    to = '',
    amount = '',
    fee = '',
    feePerUnit = '',
    feeUnit = '',
    message = '',
  }) {
    this._accountId = accountId;
    this._to = to;
    this._amount = amount;
    this._fee = fee;
    this._feePerUnit = feePerUnit;
    this._feeUnit = feeUnit;
    this._message = message;
  }

  // setter
  set accountId(accountId) { this._accountId = accountId; }

  set from(from) { this._from = from; }

  set to(to) { this._to = to; }

  set amount(amount) { this._amount = amount; }

  set fee(fee) { this._fee = fee; }

  set feePerUnit(feePerUnit) { this._feePerUnit = feePerUnit; }

  set feeUnit(feeUnit) { this._feeUnit = feeUnit; }

  set message(message) { this._message = message; }

  // getter
  get accountId() { return this._accountId; }

  get from() { return this._from; }

  get to() { return this._to; }

  get amount() { return this._amount; }

  get fee() { return this._fee; }

  get feePerUnit() { return this._feePerUnit; }

  get feeUnit() { return this._feeUnit; }

  get message() { return this._message; }
}

module.exports = Transaction;
