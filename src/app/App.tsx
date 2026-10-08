import { RouterProvider } from "react-router-dom";
import { enrutador } from "./enrutador";
import Proveedores from "./proveedores";

export default function App() {
  return (
    <Proveedores>
      <RouterProvider router={enrutador} />
    </Proveedores>
  );
}
