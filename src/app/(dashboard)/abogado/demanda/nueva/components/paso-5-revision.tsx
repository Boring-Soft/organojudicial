'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Check, AlertCircle, FileText } from 'lucide-react';
import { DemandaFormData } from '../page';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Props {
  datos: Partial<DemandaFormData>;
  onAnterior: () => void;
  onPresentar: (datos: Partial<DemandaFormData>) => void;
  isSubmitting: boolean;
}

interface Validacion {
  esValida: boolean;
  observaciones: Array<{
    campo: string;
    descripcion: string;
    articulo: string;
    nivel: 'CRITICO' | 'ADVERTENCIA';
  }>;
  puntaje: number;
}

export function Paso5Revision({ datos, onAnterior, onPresentar, isSubmitting }: Props) {
  const [validacion, setValidacion] = useState<Validacion | null>(null);
  const [validando, setValidando] = useState(false);

  useEffect(() => {
    validarDemanda();
  }, []);

  const validarDemanda = async () => {
    setValidando(true);
    // Simulación de validación - en producción llamar a la API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulación de resultado
    setValidacion({
      esValida: true,
      observaciones: [],
      puntaje: 100,
    });
    setValidando(false);
  };

  const handlePresentar = () => {
    if (validacion?.esValida) {
      onPresentar(datos);
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumen de la demanda */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Resumen de la Demanda</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Demandante</div>
            <div className="font-medium">
              {datos.demandante?.nombres} {datos.demandante?.apellidos}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Demandado</div>
            <div className="font-medium">
              {datos.demandado?.nombres} {datos.demandado?.apellidos}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Materia</div>
            <div className="font-medium">{datos.materia}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Valor</div>
            <div className="font-medium">
              Bs. {datos.valor?.toLocaleString('es-BO')}
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground mb-1">Objeto de la Demanda</div>
          <div className="p-3 bg-muted rounded-lg text-sm">
            {datos.objetoDemanda}
          </div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground mb-1">
            Anexos ({datos.anexos?.length || 0})
          </div>
          {datos.anexos && datos.anexos.length > 0 ? (
            <div className="space-y-1">
              {datos.anexos.map((anexo, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>{anexo.nombre}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Sin anexos</div>
          )}
        </div>
      </div>

      {/* Resultado de validación */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Validación Art. 110</h3>

        {validando ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Validando demanda...</p>
          </div>
        ) : validacion ? (
          <>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Cumplimiento</span>
                  <span className="text-sm font-bold">{validacion.puntaje}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${validacion.puntaje}%` }}
                  />
                </div>
              </div>
              {validacion.esValida ? (
                <Badge className="bg-green-500">
                  <Check className="h-4 w-4 mr-1" /> Válida
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="h-4 w-4 mr-1" /> Observaciones
                </Badge>
              )}
            </div>

            {!validacion.esValida && validacion.observaciones.length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Observaciones encontradas</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 space-y-1">
                    {validacion.observaciones
                      .filter(o => o.nivel === 'CRITICO')
                      .map((obs, i) => (
                        <li key={i} className="text-sm">
                          • {obs.descripcion} ({obs.articulo})
                        </li>
                      ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validacion.esValida && (
              <Alert className="mb-4 border-green-500">
                <Check className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-500">Demanda Válida</AlertTitle>
                <AlertDescription>
                  La demanda cumple con todos los requisitos del Art. 110 del Código
                  Procesal Civil. Puede proceder a presentarla.
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : null}
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onAnterior} disabled={isSubmitting}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
        </Button>
        <Button
          onClick={handlePresentar}
          disabled={!validacion?.esValida || isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? 'Presentando...' : 'Presentar Demanda'}
        </Button>
      </div>
    </div>
  );
}
