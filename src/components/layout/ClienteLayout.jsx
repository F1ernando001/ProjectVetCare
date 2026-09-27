import AppShell from "./AppShell";
import { menuCliente } from "../../data/menuData";

const ClienteLayout = () => (
  <AppShell menu={menuCliente} tituloSidebar="Mi cuenta" tituloBarra="SystemVetCare — Portal del cliente" />
);

export default ClienteLayout;
