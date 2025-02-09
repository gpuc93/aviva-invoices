# Facturas Aviva API - Documentación

## Descripción
Este proyecto proporciona un conjunto de funciones para interactuar con la API de facturas. Incluye funcionalidades como la búsqueda de facturas, la obtención de listas de clientes y estados, la creación, actualización y eliminación de facturas.

## Tecnologías utilizadas
- **Vite**
- **TypeScript**
- **React**
- **Material UI**
- **Axios** para las peticiones HTTP
- **Dayjs** para el manejo de fechas
- **Vitest** para pruebas unitarias

## Instalación
Para instalar las dependencias necesarias, ejecuta:

```sh
npm install
```

## Configuración
El proyecto requiere variables de entorno para funcionar correctamente. Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```sh
VITE_API_URL=<URL_DE_LA_API>
VITE_API_KEY=<TU_API_KEY>
```

## Uso

### 1. Búsqueda de facturas
```ts
import { invoiceApi } from "./invoiceApi";

const params = {
  search: "John Doe",
  top: 5,
  skip: 0,
  status: "paid",
  creationTime: dayjs("2022-01-01T00:00:00"),
  dueDateTime: dayjs("2022-01-05T00:00:00"),
};

invoiceApi.searchInvoices(params).then(data => console.log(data));
```

### 2. Creación de factura
```ts
const invoiceData = { amount: 100 };

invoiceApi.createInvoice(invoiceData).then(data => console.log(data));
```

### 3. Actualización de factura
```ts
const invoiceId = "123";
const updateData = { amount: 150 };

invoiceApi.updateInvoice(invoiceId, updateData).then(data => console.log(data));
```

### 4. Eliminación de factura
```ts
invoiceApi.deleteInvoice("123").then(response => console.log(response));
```

## Pruebas
El proyecto cuenta con pruebas unitarias utilizando Vitest. Para ejecutarlas, usa el siguiente comando:

```sh
npm test
```

## Estructura del Proyecto
```
/src
  ├── api
  │   ├── invoiceApi.ts
  ├── components
  ├── tests
  │   ├── invoiceApi.test.ts
  ├── models
  ├── App.tsx
  ├── main.tsx
```

## Contribución
Si deseas contribuir al proyecto, asegúrte de seguir los siguientes pasos:
1. Realizar un fork del repositorio.
2. Crear una rama con la funcionalidad o corrección.
3. Enviar un Pull Request para revisión.

## Licencia
Este proyecto está bajo la licencia MIT.

