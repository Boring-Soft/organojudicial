import Link from "next/link";
import { Scale, FileText, Users, Calendar, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "SIGPJ - Sistema Integral de Gestión Procesal Judicial",
  description:
    "Sistema Integral de Gestión Procesal Judicial del Órgano Judicial de Bolivia",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">SIGPJ</span>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/registro">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm">
            <Shield className="h-4 w-4 text-primary" />
            <span>Órgano Judicial de Bolivia</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Sistema Integral de Gestión Procesal Judicial
          </h1>
          <p className="text-xl text-muted-foreground">
            Plataforma digital para la gestión eficiente de procesos judiciales,
            facilitando el acceso a la justicia para todos los ciudadanos bolivianos.
          </p>
          <div className="flex items-center justify-center gap-4 pt-6">
            <Button asChild size="lg" className="text-lg">
              <Link href="/registro">
                Comenzar Ahora
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg">
              <Link href="/login">
                Iniciar Sesión
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Funcionalidades Principales
          </h2>
          <p className="mt-2 text-muted-foreground">
            Todo lo que necesitas para gestionar tus procesos judiciales
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Scale className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Gestión de Procesos</h3>
              <p className="text-muted-foreground">
                Seguimiento en tiempo real del estado de tus procesos judiciales
                con notificaciones automáticas.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Expediente Digital</h3>
              <p className="text-muted-foreground">
                Acceso completo a documentos procesales de forma digital y segura,
                disponible 24/7.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Vinculación Abogado</h3>
              <p className="text-muted-foreground">
                Sistema para vincular ciudadanos con abogados y gestionar la
                representación legal.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Audiencias Virtuales</h3>
              <p className="text-muted-foreground">
                Participación en audiencias de forma remota con grabación y
                transcripción automática.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Control de Plazos</h3>
              <p className="text-muted-foreground">
                Cálculo automático de plazos procesales y alertas de vencimientos
                próximos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Seguridad y Privacidad</h3>
              <p className="text-muted-foreground">
                Protección de datos con encriptación y control de acceso basado
                en roles.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Roles Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Acceso por Rol
          </h2>
          <p className="mt-2 text-muted-foreground">
            Funcionalidades específicas para cada tipo de usuario
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2">
            <CardContent className="pt-6 text-center">
              <h3 className="mb-2 text-lg font-semibold">Ciudadano</h3>
              <p className="text-sm text-muted-foreground">
                Consulta tus procesos, vincula tu abogado y accede a tus documentos
              </p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/registro/ciudadano">Registrarse</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6 text-center">
              <h3 className="mb-2 text-lg font-semibold">Abogado</h3>
              <p className="text-sm text-muted-foreground">
                Gestiona tus casos, clientes y presenta demandas digitalmente
              </p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/registro/abogado">Registrarse</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6 text-center">
              <h3 className="mb-2 text-lg font-semibold">Secretario</h3>
              <p className="text-sm text-muted-foreground">
                Gestión de citaciones, audiencias y validación de demandas
              </p>
              <Button variant="outline" className="mt-4 w-full" disabled>
                Contactar Admin
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6 text-center">
              <h3 className="mb-2 text-lg font-semibold">Juez</h3>
              <p className="text-sm text-muted-foreground">
                Emisión de resoluciones, gestión de audiencias y firma digital
              </p>
              <Button variant="outline" className="mt-4 w-full" disabled>
                Contactar Admin
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="py-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              ¿Listo para comenzar?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Regístrate ahora y accede al sistema de gestión procesal judicial
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/registro">
                  Crear Cuenta
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">
                  Ya tengo cuenta
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              <span className="font-semibold">SIGPJ</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Órgano Judicial de Bolivia. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
