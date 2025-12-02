import {
  Home,
  Scale,
  FileText,
  Users,
  Calendar,
  Folder,
} from "lucide-react";
import type { SidebarData } from "../types";

export const sidebarData: SidebarData = {
  user: {
    name: "Usuario SIGPJ",
    email: "usuario@organojudicial.gob.bo",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Órgano Judicial",
      logo: Scale,
      plan: "Sistema Integrado",
    },
  ],
  navGroups: [
    {
      title: "Principal",
      items: [
        {
          title: "Inicio",
          url: "/dashboard",
          icon: Home,
        },
        {
          title: "Mis Procesos",
          url: "/ciudadano/procesos",
          icon: Scale,
        },
        {
          title: "Documentos",
          url: "/ciudadano/documentos",
          icon: FileText,
        },
        {
          title: "Mi Abogado",
          url: "/ciudadano/abogados",
          icon: Users,
        },
        {
          title: "Calendario",
          url: "/dashboard/calendario",
          icon: Calendar,
        },
        {
          title: "Expedientes",
          url: "/dashboard/expedientes",
          icon: Folder,
        },
      ],
    },
  ],
};
