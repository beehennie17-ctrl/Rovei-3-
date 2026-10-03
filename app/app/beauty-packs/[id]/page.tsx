import { BeautyPackEditor } from "@/components/beauty-packs/beauty-pack-editor";

export default async function EditBeautyPackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BeautyPackEditor mode="edit" packId={id} />;
}
