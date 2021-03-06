const SECUtil = require('@sec-block/secjs-util')
const SECTransactionTxModel = require('../model/transactionchain-trans-model')

const TX_VERSION = '0.1'

class SECTransactionTx {
  /**
    * create a transaction chain tx with config
    * @param {*} config
    */
  constructor (tx = {}) {
    this.txBuffer = []
    this.tx = SECTransactionTxModel

    if (Object.keys(tx).length !== 0) {
      this.setTx(tx)
    }
  }

  getTx () {
    return this.tx
  }

  getTxBuffer () {
    return this.txBuffer
  }

  setTx (tx) {
    if (!(Array.isArray(tx))) {
      // set tx from json data
      this._setTxFromJson(tx)
    } else {
      // set tx from txBuffer data
      this._setTxFromBuffer(tx)
    }
  }

  _setTxFromJson (tx) {
    let self = this
    // clear this.tx
    this.tx = SECTransactionTxModel

    // set this.tx
    Object.keys(tx).forEach(function (key) {
      if (!(key in tx)) {
        throw new Error(`key: ${key} is not recognized`)
      }
      self.tx.key = tx.key
    })
    this.tx.TxHash = this._calculateTxHash()

    // set this.txBuffer
    this.txBuffer = [
      Buffer.from(this.tx.TxHash, 'hex'),
      Buffer.from(this.tx.TxReceiptStatus),
      Buffer.from(this.tx.Version),
      SECUtil.intToBuffer(this.tx.TimeStamp),
      Buffer.from(this.tx.SellerAddress),
      Buffer.from(this.tx.BuyerAddress),
      Buffer.from(this.tx.ShareHash),
      SECUtil.intToBuffer(this.tx.ShareTimeStamp),
      Buffer.from(JSON.stringify(this.tx.ProductInfo)),
      SECUtil.intToBuffer(this.tx.SharedTimes),
      Buffer.from(this.tx.Status),
      Buffer.from(this.tx.InputData)
    ]
  }

  _setTxFromBuffer (txBuffer) {
    // clear this.tx
    this.tx = SECTransactionTxModel

    if (txBuffer.length !== 12) {
      throw new Error(`input txBuffer length(${txBuffer.length}) mismatch, its length should be: 12`)
    }

    // set this.tx
    this.tx.TxHash = txBuffer[0].toString('hex')
    this.tx.TxReceiptStatus = txBuffer[1].toString()
    this.tx.Version = txBuffer[2].toString()
    this.tx.TimeStamp = SECUtil.bufferToInt(txBuffer[3])
    this.tx.SellerAddress = txBuffer[4].toString()
    this.tx.BuyerAddress = txBuffer[5].toString()
    this.tx.ShareHash = txBuffer[6].toString()
    this.tx.ShareTimeStamp = SECUtil.bufferToInt(txBuffer[7])
    this.tx.ProductInfo = JSON.parse(txBuffer[8].toString())
    this.tx.SharedTimes = SECUtil.bufferToInt(txBuffer[9])
    this.tx.Status = txBuffer[10].toString()
    this.tx.InputData = txBuffer[11].toString()

    // set this.txBuffer
    this.txBuffer = txBuffer
  }

  _calculateTxHash () {
    let txHashBuffer = [
      Buffer.from(TX_VERSION),
      SECUtil.intToBuffer(this.tx.TimeStamp),
      Buffer.from(this.tx.SellerAddress, 'hex'),
      Buffer.from(this.tx.BuyerAddress, 'hex'),
      Buffer.from(this.tx.ShareHash),
      Buffer.from(this.tx.ShareTimeStamp),
      SECUtil.intToBuffer(this.tx.SharedTimes),
      Buffer.from(this.tx.InputData)
    ]

    return SECUtil.rlphash(txHashBuffer).toString('hex')
  }

  getTxHash () {
    if (this.tx.TxHash !== '') {
      return this.tx.TxHash
    } else {
      throw Error('transaction hash not defined')
    }
  }
}

module.exports = SECTransactionTx
