import axios from 'axios';

export class Paystack {
  private api_link = 'https://api.paystack.co/';
  private reference: string;
  private amount: number;
  private Authorization: string;
  private email: string;
  private callback_url: string;
  private currency: string;

  setCurrency(currency: string) {
    this.currency = currency;
    return this;
  }

  setReferenceNumber(reference: string) {
    this.reference = reference;
    return this;
  }

  setCallbackUrl(callback_url: string) {
    this.callback_url = callback_url;
    return this;
  }

  setTransactionAmount(amount: number) {
    this.amount = amount * 100;
    return this;
  }

  setAuthorization(Authorization: string) {
    this.Authorization = Authorization;
    return this;
  }

  setCustomer(email: string) {
    if (!email) {
      throw new Error('name, email and phone number is required');
    }
    this.email = email;
    return this;
  }

  empty(data: any) {
    return data === undefined || data === null || !data;
  }

  async initialize() {
    if (this.empty(this.amount)) {
      throw new Error('transaction_amount data is required ');
    }
    if (this.empty(this.email)) {
      throw new Error('customer data is required ');
    }

    const payload: any = {
      reference: this.reference,
      amount: this.amount,
      email: this.email,
      currency: this.currency,
      callback_url: this.callback_url,
    };

    const res: any = {};

    axios.defaults.headers.common['Authorization'] = `Bearer ${this.Authorization}`;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Cache-Control'] = 'no-cache';

    await axios
      .post(`${this.api_link}transaction/initialize`, payload)
      .then(function (result: { data: any }) {
        const response = result.data;
        if (response.status === true) {
          res.success = true;
          res.message = response.message;
          res.link = response.data.authorization_url;
        } else {
          res.success = false;
          res.message = response.message;
        }
      })
      .catch(function (error: { response: { data: any } }) {
        console.log(error.response.data);
        res.success = false;
        res.message = error.response.data;
      });

    return res;
  }

  async verify() {
    if (this.empty(this.reference)) {
      throw new Error('reference data is required ');
    }
    const res: any = {};
    res.success = false;

    axios.defaults.headers.common['Authorization'] = `Bearer ${this.Authorization}`;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Cache-Control'] = 'no-cache';

    await axios
      .get(`${this.api_link}transaction/verify/${this.reference}`)
      .then(function (result: { data: any }) {
        const response = result.data;
        if (response.status) {
          res.success = true;
          res.message = response.message;
          res.data = response.data;
        }
      })
      .catch(function (error: { response: { data: any } }) {
        console.log(error.response);
        res.success = false;
        res.message = error.response.data;
      });

    return res;
  }
}
