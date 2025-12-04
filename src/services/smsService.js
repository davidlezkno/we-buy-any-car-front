/**
 * SMS Service - Handles SMS related API calls
 * Implements Single Responsibility Principle (SRP)
 */

import httpClient from './utils/httpClient';

/**
 * Send SMS message
 * @param {Object} smsData - SMS data (phoneNumber, message, etc.)
 * @returns {Promise<Object>} SMS send result
 */
export const sendSms = async (smsData, retries = 3) => {
    try {
        const token = sessionStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`
        };
        const response = await httpClient.post(`http://localhost:5001/api/Sms/send`, smsData, { headers });
        return response.data;
    } catch (error) {
        console.error('Send SMS error:', error);
        if (retries === 0) return null;
        return sendSms(smsData, retries - 1);
    }
};

export const smsService = {
    sendSms,
};
