'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { ChatWindow } from '@/components/chat/chat-window';

interface Proceso {
  id: string;
  nurej: string;
  materia: string;
  partes: Array<{
    id: string;
    tipo: string;
    nombres: string;
    apellidos: string;
    abogadoId: string | null;
    usuarioId: string | null;
  }>;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const [proceso, setProceso] = useState<Proceso | null>(null);
  const [loading, setLoading] = useState(true);
  const [destinatario, setDestinatario] = useState<{
    id: string;
    nombre: string;
  } | null>(null);

  // TODO: Obtener del contexto de autenticación
  const currentUserId = 'user-id-placeholder';
  const currentUserName = 'Usuario Actual';
  const currentUserRole = 'CIUDADANO'; // O 'ABOGADO'

  useEffect(() => {
    cargarProceso();
  }, [params.procesoId]);

  const cargarProceso = async () => {
    try {
      const response = await fetch(`/api/procesos/${params.procesoId}`);
      if (!response.ok) throw new Error('Proceso no encontrado');

      const data = await response.json();
      setProceso(data);

      // Determinar destinatario según rol
      if (currentUserRole === 'CIUDADANO') {
        // Buscar al abogado
        const parte = data.partes.find((p: any) => p.usuarioId === currentUserId);
        if (parte && parte.abogadoId) {
          // TODO: Cargar info del abogado
          setDestinatario({
            id: parte.abogadoId,
            nombre: parte.abogadoNombres || 'Abogado',
          });
        }
      } else if (currentUserRole === 'ABOGADO') {
        // Buscar al ciudadano
        const parte = data.partes.find((p: any) => p.abogadoId === currentUserId);
        if (parte && parte.usuarioId) {
          setDestinatario({
            id: parte.usuarioId,
            nombre: `${parte.nombres} ${parte.apellidos}`,
          });
        }
      }
    } catch (error) {
      console.error('Error al cargar proceso:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!proceso) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Proceso no encontrado</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!destinatario) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No hay un destinatario disponible para este chat.
            {currentUserRole === 'CIUDADANO' && ' Necesita tener un abogado asignado.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>

        <div>
          <h1 className="text-3xl font-bold mb-2">Chat del Proceso</h1>
          <p className="text-muted-foreground">
            NUREJ: {proceso.nurej} - {proceso.materia}
          </p>
        </div>
      </div>

      <ChatWindow
        procesoId={proceso.id}
        destinatarioId={destinatario.id}
        destinatarioNombre={destinatario.nombre}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
      />
    </div>
  );
}
