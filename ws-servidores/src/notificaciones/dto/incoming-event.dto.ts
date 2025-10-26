// Esto define la forma que Rust debe enviar.
export class IncomingEventDto {
  type!: string; // ej: "urgent_case" o "adoption.created"
  payload!: any; // cualquier JSON con datos
  target?: {
    room?: string; // ej "shelter:42"
  };
}
