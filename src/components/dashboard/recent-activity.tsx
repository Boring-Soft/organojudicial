"use client";

import { useState } from "react";
import { Search, Scale, FileText, Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Activity {
  id: string;
  name: string;
  type: "proceso" | "documento" | "audiencia";
  action: string;
  timestamp: string;
  code: string;
  status: "completado" | "pendiente" | "urgente";
}

const mockActivities: Activity[] = [
  {
    id: "1",
    name: "Proceso Civil - Divorcio",
    type: "proceso",
    action: "Nueva resolución emitida por el juzgado",
    timestamp: "Hace 2 horas",
    code: "LP-2024-12345",
    status: "completado",
  },
  {
    id: "2",
    name: "Documento Pendiente",
    type: "documento",
    action: "Respuesta a la demanda - Plazo: 5 días",
    timestamp: "Hace 1 día",
    code: "DOC-456",
    status: "urgente",
  },
  {
    id: "3",
    name: "Audiencia Preliminar",
    type: "audiencia",
    action: "Programada para el 15 de diciembre",
    timestamp: "Hace 2 días",
    code: "AUD-789",
    status: "pendiente",
  },
  {
    id: "4",
    name: "Proceso Laboral",
    type: "proceso",
    action: "Citación al demandado realizada",
    timestamp: "Hace 3 días",
    code: "LP-2024-54321",
    status: "completado",
  },
  {
    id: "5",
    name: "Pruebas Documentales",
    type: "documento",
    action: "Documentos recibidos y anexados al expediente",
    timestamp: "Hace 5 días",
    code: "DOC-789",
    status: "completado",
  },
];

export function RecentActivity() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredActivities = mockActivities.filter((activity) =>
    activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "proceso":
        return <Scale className="h-4 w-4" />;
      case "documento":
        return <FileText className="h-4 w-4" />;
      case "audiencia":
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Activity["status"]) => {
    switch (status) {
      case "completado":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "urgente":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "pendiente":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Actividad Reciente</h2>
            <p className="text-sm text-muted-foreground mt-1">Seguimiento de tus procesos y documentos</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar actividades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No se encontró actividad reciente</p>
              <p className="text-sm">La actividad aparecerá aquí cuando haya movimientos en tus procesos</p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
              >
                <Avatar className="h-10 w-10 border-2 border-blue-500/20">
                  <AvatarFallback className="bg-blue-500/10 text-blue-500 font-semibold">
                    {getIcon(activity.type)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm truncate">{activity.name}</p>
                    <span className="text-xs text-muted-foreground">({activity.code})</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{activity.action}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
