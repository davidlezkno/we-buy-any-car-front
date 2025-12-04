/**
 * Content Service - Handles content related API calls (FAQs, Landing Pages)
 * Implements Single Responsibility Principle (SRP)
 */

import httpClient from './utils/httpClient';

/**
 * Get all FAQs
 * @returns {Promise<Object>} List of FAQs
 */
export const getFaqs = async (retries = 3) => {
    try {
        const token = sessionStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`
        };
        const response = await httpClient.get(`http://localhost:5001/api/content/faqs`, { headers });
        return response.data;
    } catch (error) {
        console.error('Get FAQs error:', error);
        if (retries === 0) return [];
        return getFaqs(retries - 1);
    }
};

/**
 * Get FAQ by slug
 * @param {string} slug - FAQ slug
 * @returns {Promise<Object>} FAQ details
 */
export const getFaqBySlug = async (slug, retries = 3) => {
    try {
        const token = sessionStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`
        };
        const response = await httpClient.get(`http://localhost:5001/api/content/faqs/${slug}`, { headers });
        return response.data;
    } catch (error) {
        console.error('Get FAQ by slug error:', error);
        if (retries === 0) return null;
        return getFaqBySlug(slug, retries - 1);
    }
};

/**
 * Get landing page content
 * @returns {Promise<Object>} Landing page content
 */
export const getLandingPage = async (retries = 3) => {
    try {
        const token = sessionStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`
        };
        const response = await httpClient.get(`http://localhost:5001/api/content/landing-page`, { headers });
        return response.data;
    } catch (error) {
        console.error('Get landing page error:', error);
        if (retries === 0) return [];
        return getLandingPage(retries - 1);
    }
};

/**
 * Get landing page item by slug
 * @param {string} slug - Landing page item slug
 * @returns {Promise<Object>} Landing page item details
 */
export const getLandingPageBySlug = async (slug, retries = 3) => {
    try {
        const token = sessionStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`
        };
        const response = await httpClient.get(`http://localhost:5001/api/content/landing-page/${slug}`, { headers });
        return response.data;
    } catch (error) {
        console.error('Get landing page by slug error:', error);
        if (retries === 0) return null;
        return getLandingPageBySlug(slug, retries - 1);
    }
};

export const contentService = {
    getFaqs,
    getFaqBySlug,
    getLandingPage,
    getLandingPageBySlug,
};
