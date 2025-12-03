'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Scale, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface InfoCitacion {
  nurej: string;
  juzgado: string;
  juez: string;
  parte: {
    nombres: string;
    apellidos: string;
  };
  tipo: string;
}

export default function ConfirmacionCitacionPage() {
  const params = useParams();
  const [info, setInfo] = useState<InfoCitacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [confirmada, setConfirmada] = useState(false);
  const [error, setError] = useState('');
  const [ci, setCi] = useState('');

  useEffect(() => {
    cargarInfo();
  }, [params.token]);

  const cargarInfo = async () => {
    try {
      const response = await fetch(`/api/citaciones/confirmar/${params.token}`);
      if (response.ok) {
        const data = await response.json();
        setInfo(data);
      } else {
        setError('Token de citación inválido o expirado');
      }
    } catch (error) {
      setError('Error al cargar información de la citación');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async () => {
    if (!ci || ci.trim().length === 0) {
      setError('Debe ingresar su cédula de identidad');
      return;
    }

    setConfirmando(true);
    setError('');

    try {
      const response = await fetch(`/api/citaciones/confirmar/${params.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ci: ci.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setConfirmada(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Error al confirmar la citación');
      }
    } catch (error) {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setConfirmando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Scale className="h-10 w-10" />
            <div>
              <h1 className="text-3xl font-bold">Confirmación de Citación Judicial</h1>
              <p className="opacity-90">Sistema Integral de Gestión Procesal Judicial</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {error && !info ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : confirmada ? (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">
                Citación Confirmada Exitosamente
              </CardTitle>
              <CardDescription>
                Se ha registrado la recepción de su citación judicial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTitle>Próximos pasos</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>
                      Tiene un plazo de <strong>30 días hábiles</strong> para contestar la
                      demanda
                    </li>
                    <li>
                      Debe presentarse con un abogado en el {info?.juzgado}
                    </li>
                    <li>Guarde el número de proceso: <strong>{info?.nurej}</strong></li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div>
                  <span className="font-semibold">NUREJ:</span> {info?.nurej}
                </div>
                <div>
                  <span className="font-semibold">Juzgado:</span> {info?.juzgado}
                </div>
                <div>
                  <span className="font-semibold">Juez:</span> {info?.juez}
                </div>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Esta confirmación ha sido registrada en el sistema judicial
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Citación Judicial</CardTitle>
              <CardDescription>
                Confirme la recepción de su citación judicial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>
                  Ha recibido una citación judicial. Confirme su recepción ingresando su
                  cédula de identidad.
                </AlertDescription>
              </Alert>

              {info && (
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-lg">Información del Proceso</h3>
                  <div className="grid gap-2 text-sm">
                    <div>
                      <span className="font-semibold">NUREJ:</span> {info.nurej}
                    </div>
                    <div>
                      <span className="font-semibold">Juzgado:</span> {info.juzgado}
                    </div>
                    <div>
                      <span className="font-semibold">Juez:</span> {info.juez}
                    </div>
                    <div>
                      <span className="font-semibold">Tipo de citación:</span> {info.tipo}
                    </div>
                    <div className="pt-2 border-t">
                      <span className="font-semibold">Citado a:</span> {info.parte.nombres}{' '}
                      {info.parte.apellidos}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="ci">Cédula de Identidad*</Label>
                <Input
                  id="ci"
                  placeholder="Ej: 12345678-LP"
                  value={ci}
                  onChange={(e) => setCi(e.target.value)}
                  disabled={confirmando}
                />
                <p className="text-sm text-muted-foreground">
                  Ingrese su CI para confirmar que usted es la persona citada
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleConfirmar}
                disabled={confirmando || !ci}
                className="w-full"
                size="lg"
              >
                {confirmando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  'Confirmar Recepción de Citación'
                )}
              </Button>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-900">
                  <strong>Nota legal:</strong> Al confirmar esta citación, se considera
                  que ha sido notificado formalmente del proceso judicial. A partir de
                  este momento, comienza a correr el plazo de 30 días hábiles para
                  presentar su contestación.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Sistema Integral de Gestión Procesal Judicial - Bolivia</p>
          <p className="mt-1">
            Para consultas, contacte con el juzgado correspondiente
          </p>
        </div>
      </div>
    </div>
  );
}
