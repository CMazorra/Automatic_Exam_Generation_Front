import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // Añadiremos esto después
import { Label } from "@/components/ui/label";   // Y esto

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Crear Proyecto</CardTitle>
          <CardDescription>
            Despliega tu nuevo proyecto en un clic.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="framework">Framework</Label>
            <Select>
                <SelectTrigger id="framework">
                <SelectValue placeholder="Selecciona un framework" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="nextjs">Next.js</SelectItem>
                <SelectItem value="sveltekit">SvelteKit</SelectItem>
                <SelectItem value="astro">Astro</SelectItem>
                <SelectItem value="nuxt">Nuxt.js</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="framework">Framework</Label>
            {/* Reemplazaremos esto con un componente Select más tarde */}
            <Input id="framework" placeholder="ej. Next.js" />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Desplegar</Button>
        </CardFooter>
      </Card>
    </main>
  );
}