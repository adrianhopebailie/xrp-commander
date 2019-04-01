import { api, getXrpAddressAndSecret, signSubmitVerify } from '../../utils/xrp'
import { FormattedTransactionType } from 'ripple-lib';


export async function execute (fields :any): Promise<FormattedTransactionType> {

  const { address, secret } = await getXrpAddressAndSecret();

  const prepared = await (await api()).prepareSettings(address, fields);
  console.log('AccountSet transaction prepared...');

  return signSubmitVerify(prepared, secret);
}
