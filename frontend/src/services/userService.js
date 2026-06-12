import api from './api';

export const userService = {

    updateProfile: async (username, email) => {
        const response = await api.put('/users/me', {
            username,
            email,
        });
        return response.data;
    },

    changePassword: async (currentPassword, newPassword) => {
        const response = await api.put('/users/me/password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    },
};