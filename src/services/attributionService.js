/**
 * Attribution Service - Handles attribution related API calls
 * Implements Single Responsibility Principle (SRP)
 */

import httpClient from './utils/httpClient';

/**
 * Create or update visitor attribution
 * @param {string} oldVisitorId - Optional old visitor ID for migration
 * @returns {Promise<Object>} Visitor data
 */
export const createVisitor = async (oldVisitorId = null, retries = 3) => {
    try {
        const token = sessionStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`
        };
        let url = 'http://localhost:5001/api/Attribution/visitor';
        if (oldVisitorId) {
            url += `?oldVisitorId=${oldVisitorId}`;
        }
        const response = await httpClient.post(url, {}, { headers });
        return response.data;
    } catch (error) {
        console.error('Create visitor error:', error);
        if (retries === 0) return null;
        return createVisitor(oldVisitorId, retries - 1);
    }
};

/**
 * Record a visit for a visitor
 * @param {string} visitorId - Visitor ID
 * @param {Object} visitData - Visit data (pageUrl, referrerUrl, etc.)
 * @returns {Promise<Object>} Visit recording result
 */
export const recordVisit = async (visitorId, visitData, retries = 3) => {
    try {
        const token = sessionStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`
        };
        const response = await httpClient.post(`http://localhost:5001/api/Attribution/visitor/${visitorId}/visit`, visitData, { headers });
        return response.data;
    } catch (error) {
        console.error('Record visit error:', error);
        if (retries === 0) return null;
        return recordVisit(visitorId, visitData, retries - 1);
    }
};

export const attributionService = {
    createVisitor,
    recordVisit,
};
