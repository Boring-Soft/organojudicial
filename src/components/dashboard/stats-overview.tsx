"use client";

import { Scale, FileText, Calendar, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  description: string;
}

function StatCard({ title, value, change, changeType, icon, description }: StatCardProps) {
  const changeColor = {
    positive: "text-green-500",
    negative: "text-red-500",
    neutral: "text-muted-foreground",
  }[changeType];

  const ChangeIcon = changeType === "positive" ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
            {icon}
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}>
            {changeType !== "neutral" && <ChangeIcon className="h-4 w-4" />}
            {change}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
}

export function StatsOverview() {
  const stats = [
    {
      title: "Procesos Activos",
      value: "8",
      change: "+2",
      changeType: "positive" as const,
      icon: <Scale className="h-5 w-5" />,
      description: "6 como actor, 2 como demandado",
    },
    {
      title: "Documentos Pendientes",
      value: "3",
      change: "Urgente",
      changeType: "negative" as const,
      icon: <FileText className="h-5 w-5" />,
      description: "Requieren tu atención",
    },
    {
      title: "Próximas Audiencias",
      value: "2",
      change: "Esta semana",
      changeType: "neutral" as const,
      icon: <Calendar className="h-5 w-5" />,
      description: "Ver calendario completo",
    },
    {
      title: "Plazos Próximos",
      value: "5",
      change: "7 días",
      changeType: "negative" as const,
      icon: <Clock className="h-5 w-5" />,
      description: "Próximo vencimiento",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
