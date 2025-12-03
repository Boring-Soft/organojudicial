'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FormularioAllanamientoProps {
  procesoId: string;
  demanda: {
    hechos: string;
    derecho: string;
    petitorio: string;
    valor: number;
  };
  onSuccess: () => void;
}

export function FormularioAllanamiento({
  procesoId,
  demanda,
  onSuccess,
}: FormularioAllanamientoProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmacion, setConfirmacion] = useState(false);
  const [dialogConfirmacion, setDialogConfirmacion] = useState(false);
  const [motivoAllanamiento, setMotivoAllanamiento] = useState('');
  const [aceptaciones, setAceptaciones] = useState({
    hechos: false,
    pretensiones: false,
    consecuencias: false,
    irrevocable: false,
  });

  const todasAceptadas =
    aceptaciones.hechos &&
    aceptaciones.pretensiones &&
    aceptaciones.consecuencias &&
    aceptaciones.irrevocable;

  const handlePresentar = () => {
    if (!todasAceptadas) {
      toast({
        title: 'Error',
        description: 'Debe aceptar todos los términos para allanarse',
        variant: 'destructive',
      });
      return;
    }

    setDialogConfirmacion(true);
  };

  const handleConfirmarAllanamiento = async () => {
    if (!confirmacion) {
      toast({
        title: 'Error',
        description: 'Debe confirmar que entiende las consecuencias',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const contenido = {
        motivoAllanamiento,
        fechaAllanamiento: new Date().toISOString(),
        demandaAceptada: {
          hechos: demanda.hechos,
          petitorio: demanda.petitorio,
          valor: demanda.valor,
        },
        aceptaciones,
      };

      const response = await fetch('/api/contestaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          procesoId,
          tipoContestacion: 'ALLANAMIENTO',
          contenido: JSON.stringify(contenido),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al presentar allanamiento');
      }

      toast({
        title: 'Allanamiento registrado',
        description:
          'Se ha registrado el allanamiento. El juez emitirá sentencia en un plazo de 15 días.',
      });

      setDialogConfirmacion(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo registrar el allanamiento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>¡ADVERTENCIA IMPORTANTE!</AlertTitle>
        <AlertDescription>
          Al allanarse, está aceptando COMPLETAMENTE las pretensiones del demandante. Esta decisión
          es IRREVOCABLE y el juez dictará sentencia a favor del actor en un plazo de 15 días.
          Asegúrese de haber consultado con su cliente antes de proceder.
        </AlertDescription>
      </Alert>

      {/* Resumen de lo que se acepta */}
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg space-y-3">
        <h3 className="font-semibold text-red-900">Al allanarse, está aceptando:</h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
            <p>
              <strong>Los hechos:</strong> Reconoce como ciertos todos los hechos alegados por el
              demandante
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
            <p>
              <strong>Las pretensiones:</strong> Acepta que el demandante tiene derecho a lo que
              solicita
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
            <p>
              <strong>La cuantía:</strong> Reconoce el valor de{' '}
              <strong>Bs. {demanda.valor?.toLocaleString('es-BO')}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Petitorio de la demanda */}
      <div>
        <Label>Petitorio de la Demanda (lo que acepta)</Label>
        <div className="mt-2 p-4 bg-muted rounded-lg">
          <p className="text-sm">{demanda.petitorio}</p>
        </div>
      </div>

      {/* Motivo del allanamiento (opcional) */}
      <div>
        <Label htmlFor="motivoAllanamiento">Motivo del Allanamiento (Opcional)</Label>
        <Textarea
          id="motivoAllanamiento"
          placeholder="Puede indicar las razones por las cuales decide allanarse (opcional)..."
          value={motivoAllanamiento}
          onChange={(e) => setMotivoAllanamiento(e.target.value)}
          className="min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Ej: "Por razones de economía procesal y reconociendo la validez de las pretensiones..."
        </p>
      </div>

      {/* Checkboxes de aceptación */}
      <div className="space-y-3 p-4 border rounded-lg">
        <Label className="text-base">Declaraciones y Aceptaciones Requeridas</Label>

        <div className="flex items-start gap-3">
          <Checkbox
            id="hechos"
            checked={aceptaciones.hechos}
            onCheckedChange={(checked) =>
              setAceptaciones({ ...aceptaciones, hechos: checked as boolean })
            }
          />
          <Label htmlFor="hechos" className="font-normal cursor-pointer">
            Acepto como ciertos todos los hechos alegados en la demanda
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="pretensiones"
            checked={aceptaciones.pretensiones}
            onCheckedChange={(checked) =>
              setAceptaciones({ ...aceptaciones, pretensiones: checked as boolean })
            }
          />
          <Label htmlFor="pretensiones" className="font-normal cursor-pointer">
            Acepto todas las pretensiones del demandante y renuncio a contestar la demanda
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="consecuencias"
            checked={aceptaciones.consecuencias}
            onCheckedChange={(checked) =>
              setAceptaciones({ ...aceptaciones, consecuencias: checked as boolean })
            }
          />
          <Label htmlFor="consecuencias" className="font-normal cursor-pointer">
            Entiendo que el juez dictará sentencia favorable al actor sin más trámite
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="irrevocable"
            checked={aceptaciones.irrevocable}
            onCheckedChange={(checked) =>
              setAceptaciones({ ...aceptaciones, irrevocable: checked as boolean })
            }
          />
          <Label htmlFor="irrevocable" className="font-normal cursor-pointer text-red-600">
            Entiendo que esta decisión es IRREVOCABLE y no podré apelar la sentencia
          </Label>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={handlePresentar}
          disabled={!todasAceptadas}
          variant="destructive"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Presentar Allanamiento
        </Button>
      </div>

      {/* Dialog de confirmación final */}
      <Dialog open={dialogConfirmacion} onOpenChange={setDialogConfirmacion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirmación Final de Allanamiento</DialogTitle>
            <DialogDescription>
              Esta es su última oportunidad para reconsiderar. Una vez confirmado, no podrá
              deshacer esta acción.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Al confirmar, el sistema registrará el allanamiento y el proceso pasará a etapa de
                sentencia. El juez emitirá sentencia favorable al demandante en un plazo máximo de
                15 días hábiles.
              </AlertDescription>
            </Alert>

            <div className="flex items-start gap-3">
              <Checkbox
                id="confirmacion"
                checked={confirmacion}
                onCheckedChange={(checked) => setConfirmacion(checked as boolean)}
              />
              <Label htmlFor="confirmacion" className="font-normal cursor-pointer">
                He consultado con mi cliente y confirmo que deseo allanarme a la demanda.
                Entiendo las consecuencias y acepto la irrevocabilidad de esta decisión.
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogConfirmacion(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmarAllanamiento}
              disabled={!confirmacion || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Confirmar Allanamiento'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
