import apiClient, { publicApiClient } from '@/lib/apiClient';
import { User } from '@/types/user';

export interface LoginRequest {
    domain: string;
    email: string;
    password: string;
    mfaOtp?: string;
}

export interface LoginResponse {
    data: {
        accessToken: string;
        refreshToken: string;
        user: User;
        isOnboarded: boolean;
        permissions: string[];
    };
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    domain: string;
}

export interface RegisterResponse {
    data: {
        user: User;
    };
    message: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface VerifyEmailRequest {
    token: string;
}

export interface AcceptInvitationRequest {
    token: string;
    password: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    data: {
        accessToken: string;
        refreshToken: string;
    };
}

const login = async (email: string, password: string, mfaOtp?: string): Promise<LoginResponse> => {
    const request = {
        email,
        password,
        mfaOtp
    };

    const response = await publicApiClient.post<LoginResponse>('/login', request);
    return response.data;
};

const register = async (name: string, email: string, password: string): Promise<RegisterResponse> => {
    const request = {
        name,
        email,
        password
    };

    const response = await publicApiClient.post<RegisterResponse>('/register', request);
    return response.data;
};

const forgotPassword = async (email: string): Promise<void> => {
    const request: ForgotPasswordRequest = {
        email
    };

    await publicApiClient.post('/forgot-password', request);
};

const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    const request: ResetPasswordRequest = {
        token,
        newPassword
    };

    await publicApiClient.post('/reset-password', request);
};

const verifyEmail = async (token: string): Promise<void> => {
    const request: VerifyEmailRequest = {
        token
    };

    await publicApiClient.post('/verify-email', request);
};

const acceptInvitation = async (token: string, password: string): Promise<void> => {
    const request: AcceptInvitationRequest = {
        token,
        password
    };

    await publicApiClient.post('/accept-invitation', request);
};

const refreshToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const request: RefreshTokenRequest = {
        refreshToken
    };

    const response = await apiClient.post<RefreshTokenResponse>('/public/refresh-token', request);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await apiClient.get('/protected/users/me');
    return response.data.data;
};

const logout = async () => {
    try {
        await apiClient.post('/public/logout');
    } catch (error) {
        // Ignore logout errors
    }
};

// Simplified methods - domain is now handled by apiClient interceptor
const forgotPasswordByDomain = async (email: string): Promise<void> => {
    const request = {
        email
    };

    await publicApiClient.post('/forgot-password', request);
};

const authService = {
    login,
    register,
    forgotPassword,
    resetPassword,
    verifyEmail,
    acceptInvitation,
    refreshToken,
    getCurrentUser,
    logout,
    forgotPasswordByDomain,
};

export const userService = authService;
export { authService };
