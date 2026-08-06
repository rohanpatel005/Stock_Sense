import { useState, useCallback } from 'react';
import { settingsService } from '../services/settingsService';

export const useSettings = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await settingsService.getProfileSettings();
            setProfile(data);
        } catch (err) {
            setError('Failed to fetch profile settings.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const requestOTP = async () => {
        try {
            const data = await settingsService.requestResetOTP();
            return { success: true, data };
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Unable to request OTP. Please try again later.';
            return { success: false, error: errorMsg };
        }
    };

    const resetAccount = async (otp) => {
        try {
            const data = await settingsService.resetPaperAccount(otp);
            // Re-fetch profile to update balance/resets
            await fetchProfile();
            return { success: true, data };
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Unable to reset account. Please try again later.';
            return { success: false, error: errorMsg };
        }
    };

    return { profile, loading, error, fetchProfile, requestOTP, resetAccount };
};
