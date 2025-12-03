'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormularioExcepcionesProps {
  procesoId: string;
  onSuccess: () => void;
}

const TIPOS_EXCEPCIONES = [
  {
    id: 'incompetencia',
    nombre: 'Incompetencia',
    descripcion: 'El juez o tribunal no tiene competencia para conocer el caso',
  },
  {
    id: 'litispendencia',
    nombre: 'Litispendencia',
    descripcion: 'Ya existe otro proceso en trámite entre las mismas partes y sobre el mismo objeto',
  },
  {
    id: 'falta_personeria',
    nombre: 'Falta de Personería',
    descripcion: 'El demandante o su abogado no tienen capacidad o legitimación para actuar',
  },
  {
    id: 'falta_capacidad',
    nombre: 'Falta de Capacidad',
    descripcion: 'El demandante carece de capacidad legal para ser parte en el proceso',
  },
  {
    id: 'cosa_juzgada',
    nombre: 'Cosa Juzgada',
    descripcion: 'Ya existe sentencia firme sobre el mismo asunto',
  },
  {
    id: 'transaccion',
    nombre: 'Transacción',
    descripcion: 'Las partes han llegado a un acuerdo extrajudicial',
  },
  {
    id: 'prescripcion',
    nombre: 'Prescripción',
    descripcion: 'Ha transcurrido el plazo legal para ejercitar la acción',
  },
  {
    id: 'caducidad',
    nombre: 'Caducidad',
    descripcion: 'Ha vencido el plazo para ejercer el derecho reclamado',
  },
];

export function FormularioExcepciones({ procesoId, onSuccess }: FormularioExcepcionesProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [excepcionesSeleccionadas, setExcepcionesSeleccionadas] = useState<string[]>([]);
  const [fundamentaciones, setFundamentaciones] = useState<Record<string, string>>({});

  const handleCheckChange = (excepcionId: string, checked: boolean) => {
    if (checked) {
      setExcepcionesSeleccionadas([...excepcionesSeleccionadas, excepcionId]);
    } else {
      setExcepcionesSeleccionadas(excepcionesSeleccionadas.filter((id) => id !== excepcionId));
      const newFundamentaciones = { ...fundamentaciones };
      delete newFundamentaciones[excepcionId];
      setFundamentaciones(newFundamentaciones);
    }
  };

  const handleSubmit = async () => {
    if (excepcionesSeleccionadas.length === 0) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar al menos una excepción',
        variant: 'destructive',
      });
      return;
    }

    // Validar que todas las excepciones seleccionadas tengan fundamentación
    const sinFundamentacion = excepcionesSeleccionadas.filter(
      (id) => !fundamentaciones[id] || fundamentaciones[id].trim().length === 0
    );

    if (sinFundamentacion.length > 0) {
      toast({
        title: 'Error',
        description: 'Debe fundamentar todas las excepciones seleccionadas',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const excepciones = excepcionesSeleccionadas.map((id) => {
        const tipo = TIPOS_EXCEPCIONES.find((e) => e.id === id);
        return {
          tipo: id,
          nombre: tipo?.nombre,
          fundamentacion: fundamentaciones[id],
        };
      });

      const response = await fetch('/api/contestaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          procesoId,
          tipoContestacion: 'EXCEPCIONES',
          excepciones,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al presentar excepciones');
      }

      toast({
        title: 'Excepciones presentadas',
        description:
          'Las excepciones previas han sido registradas. El actor tendrá 15 días para responder.',
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron presentar las excepciones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Las excepciones previas deben resolverse antes de entrar al fondo del asunto. El actor
          tendrá un plazo de 15 días hábiles para pronunciarse sobre las excepciones interpuestas.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <Label className="text-base">Seleccione las Excepciones a Interponer</Label>

        {TIPOS_EXCEPCIONES.map((excepcion) => (
          <div key={excepcion.id} className="space-y-3">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Checkbox
                id={excepcion.id}
                checked={excepcionesSeleccionadas.includes(excepcion.id)}
                onCheckedChange={(checked) =>
                  handleCheckChange(excepcion.id, checked as boolean)
                }
              />
              <div className="flex-1">
                <Label
                  htmlFor={excepcion.id}
                  className="font-semibold cursor-pointer"
                >
                  {excepcion.nombre}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {excepcion.descripcion}
                </p>

                {excepcionesSeleccionadas.includes(excepcion.id) && (
                  <div className="mt-3">
                    <Label htmlFor={`fundamentacion-${excepcion.id}`} className="text-sm">
                      Fundamentación <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id={`fundamentacion-${excepcion.id}`}
                      placeholder={`Fundamente la excepción de ${excepcion.nombre.toLowerCase()}...`}
                      value={fundamentaciones[excepcion.id] || ''}
                      onChange={(e) =>
                        setFundamentaciones({
                          ...fundamentaciones,
                          [excepcion.id]: e.target.value,
                        })
                      }
                      className="mt-2 min-h-[120px]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Nota procesal:</strong> Si el juez declara fundada alguna de las excepciones, el
          proceso podrá suspenderse o archivarse según corresponda. Las excepciones deben estar
          debidamente fundamentadas con base legal.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" disabled={loading}>
          Guardar Borrador
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Presentando...
            </>
          ) : (
            'Presentar Excepciones'
          )}
        </Button>
      </div>
    </div>
  );
}
