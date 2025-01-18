import axios from 'axios';
import config from '../../config';

export const generateAccessToken = async () => {
  const auth = Buffer.from(
    `${config.paypal.PAYPAL_CLIENT}:${config.paypal.PAYPAL_SECRET}`,
  ).toString('base64');
  const response = await axios({
    url: `${config.paypal.PAYPAL_BASE_URL}/v1/oauth2/token`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
    },
    data: 'grant_type=client_credentials',
  });
  return response.data.access_token;
};

export const getPaypalOrder = async (orderId: string) => {
  const access_token = await generateAccessToken();
  const response = await axios({
    url: `${config.paypal.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`,
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
  });
  return response;
};

export const createOrder = async (
  amount: string,
  userId: string,
  purpose: string,
) => {
  const access_token = await generateAccessToken();
  const response = await axios({
    url: `${config.paypal.PAYPAL_BASE_URL}/v2/checkout/orders`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    data: {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount,
          },
        },
      ],
      application_context: {
        return_url: `https://my-app-nine-tau-26.vercel.app/payment-complete?userId=${userId}&purpose=${purpose}`,
        cancel_url: `http://facebook.com`,
      },
    },
  });
  return response.data;
};

export const captureOrder = async (orderId: string) => {
  const access_token = await generateAccessToken();
  const response = await axios({
    url: `${config.paypal.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
  });
  return response.data;
};
