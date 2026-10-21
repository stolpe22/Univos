import { redirect } from "next/navigation";

// O proxy já redireciona; isto é só garantia.
export default function Raiz() {
  redirect("/inicio");
}
