'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Scale } from 'lucide-react';

interface Edicto {
  id: string;
  nurej: string;
  fechaPublicacion: string;
  juzgado: string;
  materia: string;
  juez: string;
  demandado: {
    nombres: string;
    apellidos: string;
    ci: string;
  };
}

export default function EdictosPubicosPage() {
  const [edictos, setEdictos] = useState<Edicto[]>([]);
  const [filtrados, setFiltrados] = useState<Edicto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState({
    ci: '',
    nombre: '',
  });

  useEffect(() => {
    cargarEdictos();
  }, []);

  const cargarEdictos = async () => {
    try {
      const response = await fetch('/api/edictos');
      if (response.ok) {
        const data = await response.json();
        setEdictos(data);
        setFiltrados(data);
      }
    } catch (error) {
      console.error('Error al cargar edictos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busqueda.ci) params.append('ci', busqueda.ci);
      if (busqueda.nombre) params.append('nombre', busqueda.nombre);

      const response = await fetch(`/api/edictos?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setFiltrados(data);
      }
    } catch (error) {
      console.error('Error al buscar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setBusqueda({ ci: '', nombre: '' });
    setFiltrados(edictos);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Scale className="h-12 w-12" />
            <div>
              <h1 className="text-4xl font-bold">Portal de Edictos Judiciales</h1>
              <p className="text-lg opacity-90">
                Sistema Integral de Gestión Procesal Judicial - Bolivia
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Buscador */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Búsqueda de Edictos
            </CardTitle>
            <CardDescription>
              Busque edictos judiciales por CI o nombre del demandado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Buscar por CI (ej: 12345678-LP)"
                value={busqueda.ci}
                onChange={(e) => setBusqueda({ ...busqueda, ci: e.target.value })}
              />
              <Input
                placeholder="Buscar por nombre o apellido"
                value={busqueda.nombre}
                onChange={(e) => setBusqueda({ ...busqueda, nombre: e.target.value })}
              />
              <div className="flex gap-2">
                <Button onClick={handleBuscar} className="flex-1">
                  <Search className="h-4 w-4 mr-2" /> Buscar
                </Button>
                <Button variant="outline" onClick={handleLimpiar}>
                  Limpiar
                </Button>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Información importante:</strong> Los edictos publicados en este portal
                tienen validez legal. Si encuentra su nombre, contacte con su abogado o
                acuda al juzgado correspondiente.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            Edictos Publicados ({filtrados.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filtrados.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No se encontraron edictos</p>
              <p className="text-sm text-muted-foreground mt-2">
                Intente con otros criterios de búsqueda
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtrados.map((edicto) => (
              <Card key={edicto.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{edicto.nurej}</CardTitle>
                      <CardDescription>{edicto.juzgado}</CardDescription>
                    </div>
                    <Badge variant="destructive">EDICTO</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-red-900 mb-1">
                      SE CITA A:
                    </p>
                    <p className="font-bold text-red-900">
                      {edicto.demandado.nombres} {edicto.demandado.apellidos}
                    </p>
                    <p className="text-sm text-red-700">CI: {edicto.demandado.ci}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold">Materia:</span> {edicto.materia}
                    </div>
                    <div>
                      <span className="font-semibold">Juez:</span> {edicto.juez}
                    </div>
                    <div>
                      <span className="font-semibold">Fecha de publicación:</span>{' '}
                      {new Date(edicto.fechaPublicacion).toLocaleDateString('es-BO')}
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Por este medio se cita a la persona mencionada para que se apersone
                      al juzgado en el plazo establecido por ley.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <Card className="mt-8">
          <CardContent className="py-6">
            <div className="text-center text-sm text-muted-foreground">
              <p className="font-semibold mb-2">
                Sistema Integral de Gestión Procesal Judicial - SIGPJ
              </p>
              <p>
                Este portal es de carácter informativo y tiene validez legal según
                el Código Procesal Civil de Bolivia.
              </p>
              <p className="mt-2">
                Para más información, contacte con el juzgado correspondiente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
