'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Paso1Partes } from './components/paso-1-partes';
import { Paso2Detalles } from './components/paso-2-detalles';
import { Paso3Fundamentos } from './components/paso-3-fundamentos';
import { Paso4Anexos } from './components/paso-4-anexos';
import { Paso5Revision } from './components/paso-5-revision';
import { useToast } from '@/components/ui/use-toast';

export interface DemandaFormData {
  // Paso 1: Partes
  demandante: {
    ci: string;
    nombres: string;
    apellidos: string;
    edad: number;
    estadoCivil: string;
    profesion: string;
    domicilioReal: string;
    domicilioProcesal: string;
  };
  demandado: {
    ci: string;
    nombres: string;
    apellidos: string;
    domicilioReal: string;
  };
  clienteId?: string; // ID del ciudadano vinculado

  // Paso 2: Detalles
  designacionJuez: string;
  objetoDemanda: string;
  materia: string;
  valor: number;
  juzgado: string;

  // Paso 3: Fundamentos
  hechos: string;
  derecho: string;
  petitorio: string;
  ofrecimientoPrueba: string;

  // Paso 4: Anexos
  anexos: Array<{
    nombre: string;
    url: string;
    tipo: string;
    size: number;
    hash: string;
  }>;
}

const pasos = [
  { numero: 1, titulo: 'Partes', descripcion: 'Demandante y Demandado' },
  { numero: 2, titulo: 'Detalles', descripcion: 'Información del proceso' },
  { numero: 3, titulo: 'Fundamentos', descripcion: 'Hechos, Derecho y Petitorio' },
  { numero: 4, titulo: 'Anexos', descripcion: 'Documentos probatorios' },
  { numero: 5, titulo: 'Revisión', descripcion: 'Validar y presentar' },
];

export default function NuevaDemandaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pasoActual, setPasoActual] = useState(1);
  const [formData, setFormData] = useState<Partial<DemandaFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progreso = (pasoActual / pasos.length) * 100;

  const handleSiguiente = (datos: Partial<DemandaFormData>) => {
    setFormData({ ...formData, ...datos });
    if (pasoActual < pasos.length) {
      setPasoActual(pasoActual + 1);
    }
  };

  const handleAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
    }
  };

  const handlePresentar = async (datosFinales: Partial<DemandaFormData>) => {
    try {
      setIsSubmitting(true);
      const datosCompletos = { ...formData, ...datosFinales };

      // 1. Crear proceso
      const responseProceso = await fetch('/api/procesos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'ORDINARIO',
          materia: datosCompletos.materia,
          juzgado: datosCompletos.juzgado,
          juezId: datosCompletos.designacionJuez, // Asumimos que designacionJuez es el ID del juez
          objetoDemanda: datosCompletos.objetoDemanda,
        }),
      });

      if (!responseProceso.ok) {
        throw new Error('Error al crear el proceso');
      }

      const proceso = await responseProceso.json();

      // 2. Crear partes del proceso
      await fetch(`/api/procesos/${proceso.id}/partes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partes: [
            {
              tipo: 'ACTOR',
              ...datosCompletos.demandante,
            },
            {
              tipo: 'DEMANDADO',
              ...datosCompletos.demandado,
            },
          ],
        }),
      });

      // 3. Crear demanda
      const responseDemanda = await fetch('/api/demandas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          procesoId: proceso.id,
          designacionJuez: datosCompletos.designacionJuez,
          objetoDemanda: datosCompletos.objetoDemanda,
          hechos: datosCompletos.hechos,
          derecho: datosCompletos.derecho,
          petitorio: datosCompletos.petitorio,
          valor: datosCompletos.valor,
          ofrecimientoPrueba: datosCompletos.ofrecimientoPrueba,
          anexos: datosCompletos.anexos || [],
        }),
      });

      if (!responseDemanda.ok) {
        throw new Error('Error al crear la demanda');
      }

      const demanda = await responseDemanda.json();

      // 4. Presentar demanda
      const responsePresentar = await fetch(`/api/demandas/${demanda.id}/presentar`, {
        method: 'POST',
      });

      if (!responsePresentar.ok) {
        const error = await responsePresentar.json();
        throw new Error(error.error || 'Error al presentar la demanda');
      }

      toast({
        title: '¡Demanda presentada exitosamente!',
        description: `NUREJ: ${proceso.nurej}`,
      });

      // Redirigir al proceso
      router.push(`/abogado/casos/${proceso.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPaso = () => {
    const props = {
      datos: formData,
      onSiguiente: handleSiguiente,
      onAnterior: handleAnterior,
    };

    switch (pasoActual) {
      case 1:
        return <Paso1Partes {...props} />;
      case 2:
        return <Paso2Detalles {...props} />;
      case 3:
        return <Paso3Fundamentos {...props} />;
      case 4:
        return <Paso4Anexos {...props} />;
      case 5:
        return <Paso5Revision {...props} onPresentar={handlePresentar} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Nueva Demanda</h1>
        <p className="text-muted-foreground">
          Complete todos los pasos para crear y presentar una nueva demanda
        </p>
      </div>

      {/* Indicador de pasos */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {pasos.map((paso, index) => (
            <div key={paso.numero} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    ${
                      pasoActual === paso.numero
                        ? 'bg-primary text-primary-foreground'
                        : pasoActual > paso.numero
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {pasoActual > paso.numero ? <Check className="h-5 w-5" /> : paso.numero}
                </div>
                <div className="text-center mt-2">
                  <div className="text-sm font-medium">{paso.titulo}</div>
                  <div className="text-xs text-muted-foreground">{paso.descripcion}</div>
                </div>
              </div>
              {index < pasos.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    pasoActual > paso.numero ? 'bg-green-500' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Progress value={progreso} className="h-2" />
      </div>

      {/* Contenido del paso actual */}
      <Card>
        <CardHeader>
          <CardTitle>{pasos[pasoActual - 1].titulo}</CardTitle>
          <CardDescription>{pasos[pasoActual - 1].descripcion}</CardDescription>
        </CardHeader>
        <CardContent>{renderPaso()}</CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleAnterior}
          disabled={pasoActual === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="text-sm text-muted-foreground">
          Paso {pasoActual} de {pasos.length}
        </div>

        <div className="w-[100px]"></div> {/* Spacer para mantener el botón anterior alineado */}
      </div>
    </div>
  );
}
