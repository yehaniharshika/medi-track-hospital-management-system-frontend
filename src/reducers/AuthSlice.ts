import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Define AuthState to store both tokens
interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

// Initialize state from localStorage
const initialState: AuthState = {
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
    status: "idle",
    error: null,
};

// API Instance
const api = axios.create({
    baseURL: "http://localhost:3003/auth",
});

// Async Thunk for User Login
export const loginUser = createAsyncThunk<
    { accessToken: string; refreshToken: string },
    { username: string; password: string },
    { rejectValue: string }>(
        "auth/login",
    async ({ username, password }, { rejectWithValue }) => {
    try {
        const response = await api.post("/login", { username, password });

        // Store tokens in localStorage
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("userName", response.data.name); // Store user name
        localStorage.setItem("name", response.data.name); // Store name

        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Login failed");
    }
});

// Async Thunk for User Registration
export const registerUser = createAsyncThunk<
    string,
    { name: string; username: string; password: string; role: string }, { rejectValue: string }>(
        "auth/register",
    async ({ name, username, password, role }, { rejectWithValue }) => {
    try {
        const response = await api.post("/register", { name, username, password, role });
        return response.data.message; // Assuming the backend returns a success message
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Registration failed");
    }
});

// Async Thunk for User Logout
export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
    async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
});

// Create Auth Slice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout(state) {
            state.accessToken = null;
            state.refreshToken = null;
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        },
    },
    extraReducers: (builder) => {
        builder
            // Handle Login
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.status = "succeeded";
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "Login failed";
            })

            // Handle Registration
            .addCase(registerUser.fulfilled, (state) => {
                state.status = "succeeded";
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "Registration failed";
            })

            // Handle Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.accessToken = null;
                state.refreshToken = null;
                state.status = "idle";
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
