import { HttpClient } from './HTTPClient.mjs';

const { API_LEADLOVERS } = process.env;
export class Leadlovers {
  #service;

  constructor(token) {
    this.apiUrl = token;
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.params = {
      token,
    };
    this.#service = new HttpClient({ baseURL: API_LEADLOVERS });
  }

  async verifyCredentials() {
    const response = await this.#service.get('/Machines', {
      headers: this.headers,
      params: this.params,
    });
    return response;
  }

  async getMyMachines() {
    const { data } = await this.#service.get('/Machines', {
      headers: this.headers,
      params: this.params,
    });
    return data;
  }

  async getMyMachinesById(id) {
    const { data } = await this.#service.get(`/Machines/${id}`, {
      headers: this.headers,
      params: this.params,
    });
    return data;
  }

  async getSequences(machineCode) {
    this.params.machineCode = machineCode;
    const { data } = await this.#service.get('/EmailSequences', {
      headers: this.headers,
      params: this.params,
    });
    return data;
  }

  async getSequencesById(machineCode, sequenceCode) {
    this.params.machineCode = machineCode;
    const { data } = await this.#service.get(`/EmailSequences/${sequenceCode}`, {
      headers: this.headers,
      params: this.params,
    });
    return data;
  }

  async getLevels(machineCode, sequenceCode) {
    this.params.machineCode = machineCode;
    this.params.sequenceCode = sequenceCode;
    const { data } = await this.#service.get('/Levels', {
      headers: this.headers,
      params: this.params,
    });
    return data;
  }

  async insertContactOnLead({
    email,
    MachineCode,
    EmailSequenceCode,
    SequenceLevelCode,
    fullName,
    phone,
  }) {
    const body = {
      Email: email,
      MachineCode,
      EmailSequenceCode,
      SequenceLevelCode,
      Name: fullName,
      Phone: phone,
    };
    const { data } = await this.#service.put('/Lead', body, {
      headers: this.headers,
      params: this.params,
    });
    return data;
  }

  async removeContactOnLead(email, machineCode) {
    this.params.machineCode = machineCode;
    this.params.email = email;
    const { data } = await this.#service.delete('/Lead', {
      headers: this.headers,
      params: this.params,
    });
    return data;
  }
}
