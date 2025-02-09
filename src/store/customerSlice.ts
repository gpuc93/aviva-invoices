import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Customer } from "../models/shared-models";

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  fetched: boolean;
}

const initialState: CustomerState = {
  customers: [],
  loading: false,
  error: null,
  fetched: false,
};

export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { customers: CustomerState };
    if (state.customers.fetched) return;

    try {
      const response = await axios.get(`${API_URL}/Customer`, {
        headers: {
          "Content-Type": "application/json",
          "apikey": API_KEY,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue("Error al cargar clientes");
    }
  }
);


const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        if (action.payload) {
          state.customers = action.payload;
          state.fetched = true;
        }
        state.loading = false;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default customerSlice.reducer;
