import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Define AuthState to store both tokens and user info
interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    userName: string | null;
    name: string | null;
    email: string | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

// Initialize state from localStorage
const initialState: AuthState = {
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
    userName: localStorage.getItem("userName"),
    name: localStorage.getItem("name"),
    email: localStorage.getItem("email"),
    status: "idle",
    error: null,
};

// API Instance
const api = axios.create({
    baseURL: "http://localhost:3003/auth",
});

// Async Thunk for User Login
export const loginUser = createAsyncThunk<
    { accessToken: string; refreshToken: string; name: string; username: string; email: string },
    { username: string; password: string },
    { rejectValue: string }>(
        "auth/login",
    async ({ username, password }, { rejectWithValue }) => {
    try {
        const response = await api.post("/login", { username, password });

        // Store tokens and user info in localStorage
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("userName", response.data.username);
        localStorage.setItem("name", response.data.name);
        localStorage.setItem("email", response.data.email);

        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Login failed");
    }
});

// Async Thunk for User Registration
export const registerUser = createAsyncThunk<
    { message: string; name: string; username: string; email: string },
    { name: string; username: string; password: string; role: string; email: string }, 
    { rejectValue: string }>(
        "auth/register",
    async ({ name, username, password, role, email }, { rejectWithValue }) => {
    try {
        const response = await api.post("/register", { name, username, password, role, email });
        
        // Store user info in localStorage after successful registration
        localStorage.setItem("userName", username);
        localStorage.setItem("name", name);
        localStorage.setItem("email", email);
        
        return {
            message: response.data.message,
            name,
            username,
            email
        };
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
    localStorage.removeItem("userName");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
});

// Create Auth Slice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout(state) {
            state.accessToken = null;
            state.refreshToken = null;
            state.userName = null;
            state.name = null;
            state.email = null;
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userName");
            localStorage.removeItem("name");
            localStorage.removeItem("email");
        },
    },
    extraReducers: (builder) => {
        builder
            // Handle Login
            .addCase(loginUser.fulfilled, (state, action) => {
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.userName = action.payload.username;
                state.name = action.payload.name;
                state.email = action.payload.email;
                state.status = "succeeded";
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "Login failed";
            })

            // Handle Registration
            .addCase(registerUser.fulfilled, (state, action) => {
                state.userName = action.payload.username;
                state.name = action.payload.name;
                state.email = action.payload.email;
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
                state.userName = null;
                state.name = null;
                state.email = null;
                state.status = "idle";
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;