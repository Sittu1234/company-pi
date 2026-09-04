import { redirect } from "next/navigation";

export default async function EditCustomerRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dealers/${id}`);
}
