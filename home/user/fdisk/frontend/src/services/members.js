import axios from 'axios';
import { getAuthHeader } from './auth';

const API_URL = 'http://10.0.0.130:5000/api';

export const getMembers = async () => {
    try {
        const response = await axios.get(`${API_URL}/members`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching members:', error);
        throw error;
    }
};

export const createMember = async (memberData) => {
    try {
        const response = await axios.post(`${API_URL}/members`, memberData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error creating member:', error);
        throw error;
    }
};