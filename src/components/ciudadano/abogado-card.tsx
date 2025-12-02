'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, Briefcase, MapPin, Award, MessageSquare, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AbogadoCardProps {
  abogado: {
    id: string
    nombres: string
    apellidos: string
    registroAbogado: string | null
    email: string
    telefono: string | null
    juzgado: string | null
    activo: boolean
  }
  onSolicitarRepresentacion?: (abogadoId: string) => void
}

/**
 * Componente Card para mostrar información de un abogado
 * Muestra datos relevantes y permite solicitar representación
 */
export default function AbogadoCard({ abogado, onSolicitarRepresentacion }: AbogadoCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSolicitar = async () => {
    setIsLoading(true)
    if (onSolicitarRepresentacion) {
      await onSolicitarRepresentacion(abogado.id)
    }
    setIsLoading(false)
  }

  // Obtener iniciales para el avatar
  const getInitials = () => {
    return `${abogado.nombres.charAt(0)}${abogado.apellidos.charAt(0)}`.toUpperCase()
  }

  // Datos de ejemplo (en producción vendrían de la BD)
  const experienciaAnios = Math.floor(Math.random() * 15) + 5
  const casosGanados = Math.floor(Math.random() * 50) + 10
  const casosPerdidos = Math.floor(Math.random() * 20) + 5
  const tasaExito = Math.floor((casosGanados / (casosGanados + casosPerdidos)) * 100)
  const especialidades = ['Civil', 'Familiar']

  // Extraer ciudad del registro profesional
  const ciudad = abogado.registroAbogado?.split('-')[1] || 'Bolivia'
  const ciudadCompleta: Record<string, string> = {
    LP: 'La Paz',
    CB: 'Cochabamba',
    SC: 'Santa Cruz',
    OR: 'Oruro',
    PO: 'Potosí',
    CH: 'Chuquisaca',
    TJ: 'Tarija',
    BE: 'Beni',
    PA: 'Pando',
  }

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="border-b bg-muted/50 pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-16 w-16">
            <AvatarImage src="" alt={`${abogado.nombres} ${abogado.apellidos}`} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          {/* Información principal */}
          <div className="flex-1">
            <Link
              href={`/abogado/${abogado.id}/perfil`}
              className="group"
            >
              <h3 className="text-lg font-semibold group-hover:text-primary">
                {abogado.nombres} {abogado.apellidos}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground">
              Reg. {abogado.registroAbogado || 'N/A'}
            </p>

            {/* Estado */}
            <div className="mt-2">
              {abogado.activo ? (
                <Badge variant="default" className="text-xs">
                  Disponible
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  No disponible
                </Badge>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">4.5</span>
            </div>
            <p className="text-xs text-muted-foreground">15 reseñas</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Especialidades */}
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Award className="h-4 w-4 text-primary" />
            <span>Especialidades</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {especialidades.map((especialidad) => (
              <Badge key={especialidad} variant="outline" className="text-xs">
                {especialidad}
              </Badge>
            ))}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{experienciaAnios} años</p>
              <p className="text-xs text-muted-foreground">Experiencia</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{ciudadCompleta[ciudad] || ciudad}</p>
              <p className="text-xs text-muted-foreground">Ciudad</p>
            </div>
          </div>
        </div>

        {/* Tasa de éxito */}
        <div className="mt-4 rounded-lg bg-muted p-3">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">Tasa de éxito</span>
            <span className="font-bold text-primary">{tasaExito}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-background">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${tasaExito}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {casosGanados} ganados, {casosPerdidos} perdidos
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 border-t bg-muted/50 pt-4">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          asChild
        >
          <Link href={`/abogado/${abogado.id}/perfil`}>
            <User className="mr-2 h-4 w-4" />
            Ver Perfil
          </Link>
        </Button>

        <Button
          size="sm"
          className="flex-1"
          onClick={handleSolicitar}
          disabled={!abogado.activo || isLoading}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          {isLoading ? 'Solicitando...' : 'Solicitar'}
        </Button>
      </CardFooter>
    </Card>
  )
}
