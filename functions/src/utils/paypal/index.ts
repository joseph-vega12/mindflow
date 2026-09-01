import axios from 'axios';

import { paypalClientId, paypalClientSecret, paypalUrl } from '../../params';

interface Token {
  access_token: string;
  app_id: string;
  expires_in: number;
  nonce: string;
  scope: string;
  token_type: string;
}
export const getAccessToken = async (clientId: string, clientSecret: string): Promise<Token> => {
  const { data: token } = await axios({
    url: 'https://api-m.paypal.com/v1/oauth2/token',
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en_US',
      'content-type': 'application/x-www-form-urlencoded'
    },
    auth: {
      username: clientId,
      password: clientSecret
    },
    params: {
      grant_type: 'client_credentials'
    }
  });

  return token;
};

interface Order {
  id: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED';
  payer: Record<string, any>;
  purchase_units: Record<string, any>[];
}

export const retrieveOrder = async (id: string): Promise<Order> => {
  const { data: order } = await axios.get(`${paypalUrl.value()}/${id}`, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en_US',
      'content-type': 'application/x-www-form-urlencoded'
    },
    auth: {
      username: paypalClientId.value(),
      password: paypalClientSecret.value()
    },
    params: {
      grant_type: 'client_credentials'
    }
  });
  return order;
  // -H "Content-Type: application/json" \
  // -H "Authorization: Bearer Access-Token")
};
