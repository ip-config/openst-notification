"use strict";

const rootPrefix = '../..'
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
  , util = require(rootPrefix + '/lib/util')
;

const eventParams = {

  validateStakingIntent: function (params) {

    if(!util.valPresent(params['_uuid']) || !util.valPresent(params['stakingIntentHash']) ||
      !util.valPresent(params['_staker']) || !util.valPresent(params['_beneficiary']) ||
      !util.valPresent(params['_amountST']) || !util.valPresent(params['_amountUT']) ||
      !util.valPresent(params['expirationHeight']))
    {
      return Promise.resolve(responseHelper.error('ost_q_m_s_v_ep_1', 'invalid parameters'));
    }

  }

};

module.exports = eventParams;