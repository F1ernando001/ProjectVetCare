import PeopleIcon from "@mui/icons-material/People";
import PetsIcon from "@mui/icons-material/Pets";
import EventIcon from "@mui/icons-material/Event";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BadgeIcon from "@mui/icons-material/Badge";

// Menú del staff (Administrador / Veterinario)
export const menuStaff = [
  { texto: "Dashboard", ruta: "/", icono: DashboardIcon },
  { texto: "Usuarios", ruta: "/usuarios", icono: BadgeIcon, soloAdmin: true },
  { texto: "Propietarios", ruta: "/propietarios", icono: PeopleIcon },
  { texto: "Citas", ruta: "/citas", icono: EventIcon },
  { texto: "Consultas", ruta: "/consultas", icono: MedicalServicesIcon },
  { texto: "Catálogos", ruta: "/catalogos", icono: Inventory2Icon },
  { texto: "Facturas", ruta: "/facturas", icono: ReceiptLongIcon },
];

// Menú del cliente (Propietario logueado)
export const menuCliente = [
  { texto: "Mis mascotas", ruta: "/portal/mascotas", icono: PetsIcon },
  { texto: "Mis citas", ruta: "/portal/citas", icono: EventIcon },
];
