import { redirect } from "next/navigation";

export default function NewCustomerRedirect() {
  redirect("/dealers/new");
}
