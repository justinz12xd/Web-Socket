export interface Animal {
  nombre: string;
  especie: string;
  edad: number;
  estado: "disponible" | "adoptado" | "en_proceso";
  descripcion?: string;
  fotos?: string[];
  refugio?: string;
}
