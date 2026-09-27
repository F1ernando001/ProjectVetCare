import AppShell from "./AppShell";
import { menuStaff } from "../../data/menuData";

const StaffLayout = () => (
  <AppShell menu={menuStaff} tituloSidebar="Mantenimiento" tituloBarra="Sistema de Gestión — SystemVetCare" />
);

export default StaffLayout;
