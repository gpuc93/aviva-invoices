import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import axios from 'axios';
import dayjs from "dayjs";

import { invoiceApi } from '../src/api/invoiceServices';
import { InvoiceCreate } from '../src/models/shared-models';

vi.mock("axios");

const mockedAxios = axios as unknown as {
  get: Mock;
  post: Mock;
  patch: Mock;
  delete: Mock;
};

describe("invoiceApi", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("searchInvoices", () => {
        it("Debe retornar los datos cuando axios retorna 200", async () => {
            const params = {
                search: "Test",
                top: 5,
                skip: 0,
                status: "active",
                creationTime: dayjs("2023-01-01T00:00:00"),
                dueDateTime: dayjs("2023-01-02T00:00:00")
            };

            const expectedData = [{ id: 1, name: "Invoice1" }];

            mockedAxios.get.mockResolvedValueOnce({
                status: 200,
                data: expectedData
            });

            const result = await invoiceApi.searchInvoices(params);

            expect(result).toEqual(expectedData);
            expect(mockedAxios.get).toHaveBeenCalled();

            const calledUrl = mockedAxios.get.mock.calls[0][0];
            expect(calledUrl, "La URL generada no es correcta, se esperaba /Invoice/Search?").toContain("/Invoice/Search?");
        });
    });


    describe("createInvoice", () => {
        it("Debe retornar los datos cuando la factura se crea con éxito", async () => {
            const invoiceData: Partial<InvoiceCreate> = {
                customerFromId: "123",
                customerToId: "456",
                customerToFullName: "John Doe",
                shipping: 10,
                discount: 5,
                taxes: 2,
                status: "Draft",
                dueDateTime: dayjs().add(7, 'days').toISOString(),
                details: [
                    {
                        title: "Servicio de reparación",
                        description: "Cambio de batería",
                        categoryId: "1",
                        quantity: 1,
                        price: 100,
                        creationTime: dayjs().toISOString(),
                        lastModificationTime: dayjs().toISOString()
                    }
                ]
            };

            const expectedResponse = { id: "1", ...invoiceData };

            mockedAxios.post.mockResolvedValueOnce({
                status: 200,
                data: expectedResponse
            });

            const result = await invoiceApi.createInvoice(invoiceData);

            expect(result).toEqual(expectedResponse);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.stringContaining("/Invoice"),
                invoiceData,
                expect.any(Object)
            );
        });

        it("Debe retornar null cuando axios falla", async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

            const result = await invoiceApi.createInvoice({
                customerFromId: "123",
                customerToId: "456",
                customerToFullName: "John Doe",
                shipping: 10,
                discount: 5,
                taxes: 2,
                status: "Draft",
                dueDateTime: dayjs().add(7, 'days').toISOString(),
                details: []
            });

            expect(result).toBeNull();
        });
    });


    describe("updateInvoice", () => {
        it("Debe actualizar una factura correctamente", async () => {
            const invoiceId = "1";
            const invoiceData: Partial<InvoiceCreate> = { status: "Paid" };
            const expectedResponse = { id: invoiceId, ...invoiceData };

            mockedAxios.patch.mockResolvedValueOnce({
                status: 200,
                data: expectedResponse
            });

            const result = await invoiceApi.updateInvoice(invoiceId, invoiceData);

            expect(result).toEqual(expectedResponse);
            expect(mockedAxios.patch).toHaveBeenCalledWith(
                expect.stringContaining(`/Invoice/id?id=${invoiceId}`),
                invoiceData,
                expect.any(Object)
            );
        });

        it("Debe retornar null cuando la actualización falla", async () => {
            mockedAxios.patch.mockRejectedValueOnce(new Error("Network error"));

            const result = await invoiceApi.updateInvoice("1", { status: "Paid" });

            expect(result).toBeNull();
        });
    });

    describe("getInvoice", () => {
        it("Debe obtener una factura correctamente", async () => {
            const invoiceId = "1";
            const expectedData = { id: invoiceId, customerToFullName: "John Doe" };

            mockedAxios.get.mockResolvedValueOnce({
                status: 200,
                data: expectedData
            });

            const result = await invoiceApi.getInvoice(invoiceId);

            expect(result).toEqual(expectedData);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining(`/Invoice/${invoiceId}`),
                expect.any(Object)
            );
        });

        it("Debe retornar null cuando axios falla", async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));

            const result = await invoiceApi.getInvoice("1");

            expect(result).toBeNull();
        });
    });


    describe("deleteInvoice", () => {
        it("Debe eliminar una factura correctamente", async () => {
            const invoiceId = "1";
            const expectedResponse = { success: true };

            mockedAxios.delete.mockResolvedValueOnce({
                status: 200,
                data: expectedResponse
            });

            const result = await invoiceApi.deleteInvoice(invoiceId);

            expect(result).toEqual(expectedResponse);
            expect(mockedAxios.delete).toHaveBeenCalledWith(
                expect.stringContaining(`/Invoice/id?id=${invoiceId}`),
                expect.any(Object)
            );
        });

        it("Debe retornar null cuando la eliminación falla", async () => {
            mockedAxios.delete.mockRejectedValueOnce(new Error("Network error"));

            const result = await invoiceApi.deleteInvoice("1");

            expect(result).toBeNull();
        });
    });

    describe("statusList", () => {
        it("Debe obtener la lista de estados correctamente", async () => {
            const expectedData = [{ text: "Paid", value: "Paid" }];

            mockedAxios.get.mockResolvedValueOnce({
                status: 200,
                data: expectedData
            });

            const result = await invoiceApi.statusList();

            expect(result).toEqual(expectedData);
        });

        it("Debe retornar una lista vacía si hay error", async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));

            const result = await invoiceApi.statusList();

            expect(result).toEqual([]);
        });
    });

    describe("customerList", () => {
        it("Debe obtener la lista de clientes correctamente", async () => {
            const expectedData = [{ id: "1", name: "John Doe" }];

            mockedAxios.get.mockResolvedValueOnce({
                status: 200,
                data: expectedData
            });

            const result = await invoiceApi.customerList();

            expect(result).toEqual(expectedData);
        });

        it("Debe retornar una lista vacía si hay error", async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));

            const result = await invoiceApi.customerList();

            expect(result).toEqual([]);
        });
    });
});
