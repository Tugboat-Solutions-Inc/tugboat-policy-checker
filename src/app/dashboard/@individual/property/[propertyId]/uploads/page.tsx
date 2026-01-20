import Header from "@/components/common/header/header";
import { NavigateBackButton } from "@/components/common/header/navigate-back-button";
import { UploadsListContent } from "@/components/common/uploads-list-content";
import { getCachedPropertyById } from "@/lib/cached-fetchers";
import { getUploadsByUnitId } from "@/features/collection-details/api/upload.actions";
import { notFound } from "next/navigation";

interface AllUploadsPageProps {
  params: Promise<{
    propertyId: string;
  }>;
}

export type UploadWithContext = {
  id: string;
  created_at: string;
  updated_at: string;
  upload_status: string;
  photo_urls: string[];
  notes: string;
  collectionId: string;
  collectionName: string;
  unitId: string;
};

export default async function AllUploadsPage({ params }: AllUploadsPageProps) {
  const { propertyId } = await params;

  const propertyResult = await getCachedPropertyById(propertyId);

  if (!propertyResult.success) {
    notFound();
  }

  const property = propertyResult.data;

  const uploadsWithContext: UploadWithContext[] = [];

  const uploadPromises = property.units.map(async (unit) => {
    const uploadsResult = await getUploadsByUnitId(propertyId, unit.id, 1, 1000);
    if (uploadsResult.success) {
      return uploadsResult.data.data.map((upload) => ({
        id: upload.id,
        created_at: upload.created_at,
        updated_at: upload.updated_at,
        upload_status: upload.upload_status,
        photo_urls: upload.photo_urls,
        notes: upload.notes,
        collectionId: upload.collection_data?.id ?? "",
        collectionName: upload.collection_data?.name ?? "Unknown Collection",
        unitId: unit.id,
      }));
    }
    return [];
  });

  const allUploads = await Promise.all(uploadPromises);
  allUploads.forEach((uploads) => uploadsWithContext.push(...uploads));

  uploadsWithContext.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="mx-6 mt-5">
        <Header title="All Uploads" leadingButton={<NavigateBackButton />} />
      </div>
      <UploadsListContent
        propertyId={propertyId}
        uploads={uploadsWithContext}
      />
    </div>
  );
}
