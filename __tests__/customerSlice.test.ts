import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import customerReducer, { fetchCustomers } from "../src/store/customerSlice";
import { configureStore } from "@reduxjs/toolkit";
import axios from 'axios';
import { Customer } from "../src/models/shared-models";


vi.mock("axios");

const mockedAxios = axios as unknown as {
    get: Mock;
    post: Mock;
    patch: Mock;
    delete: Mock;
  };

const initialState = {
  customers: [],
  loading: false,
  error: null,
  fetched: false,
};

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "1234567890",
    address: "123 Street, City",
  },
  {
    id: "2",
    name: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "9876543210",
    address: "456 Avenue, City",
  },
];

describe("customerSlice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe tener el estado inicial correcto", () => {
    expect(customerReducer(undefined, { type: "" })).toEqual(initialState);
  });

  it("debe manejar fetchCustomers.pending correctamente", () => {
    const nextState = customerReducer(initialState, fetchCustomers.pending("", undefined));
    expect(nextState.loading).toBe(true);
    expect(nextState.error).toBeNull();
  });

  it("debe manejar fetchCustomers.fulfilled correctamente", () => {
    const fulfilledAction = {
      type: fetchCustomers.fulfilled.type,
      payload: mockCustomers,
    };

    const nextState = customerReducer(initialState, fulfilledAction);
    expect(nextState.loading).toBe(false);
    expect(nextState.customers).toEqual(mockCustomers);
    expect(nextState.fetched).toBe(true);
  });

  it("debe manejar fetchCustomers.rejected correctamente", () => {
    const rejectedAction = {
      type: fetchCustomers.rejected.type,
      payload: "Error al cargar clientes",
    };

    const nextState = customerReducer(initialState, rejectedAction);
    expect(nextState.loading).toBe(false);
    expect(nextState.error).toBe("Error al cargar clientes");
  });

  it("debe realizar una solicitud a la API cuando se ejecuta fetchCustomers", async () => {
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: mockCustomers });

    const store = configureStore({ reducer: { customers: customerReducer } });
    await store.dispatch(fetchCustomers() as any);

    const state = store.getState().customers;
    expect(state.customers).toEqual(mockCustomers);
    expect(state.loading).toBe(false);
    expect(state.fetched).toBe(true);
  });

  it("debe manejar errores cuando la API falla", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Error en la API"));

    const store = configureStore({ reducer: { customers: customerReducer } });
    await store.dispatch(fetchCustomers() as any);

    const state = store.getState().customers;
    expect(state.error).toBe("Error al cargar clientes");
    expect(state.loading).toBe(false);
  });

  it("no debe hacer una solicitud si los clientes ya fueron obtenidos", async () => {
    const preloadedState = {
      customers: mockCustomers,
      loading: false,
      error: null,
      fetched: true,
    };

    const store = configureStore({
      reducer: { customers: customerReducer },
      preloadedState: { customers: preloadedState },
    });

    await store.dispatch(fetchCustomers() as any);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });
});
