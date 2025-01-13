import axios from 'axios';
import { getAuthHeader } from './auth';

const API_URL = 'http://10.0.0.130:5000/api';

export const getMembers = async () => {
    const response = await axios.get(`${API_URL}/members`, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const getMember = async (id) => {
    const response = await axios.get(`${API_URL}/members/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const createMember = async (memberData) => {
    const response = await axios.post(`${API_URL}/members`, memberData, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const updateMember = async (id, memberData) => {
    const response = await axios.put(`${API_URL}/members/${id}`, memberData, {
        headers: getAuthHeader()
    });
    return response.data;
};