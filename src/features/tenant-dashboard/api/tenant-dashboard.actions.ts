"use server";

import { getCachedProperties } from "@/lib/cached-fetchers";

type KpiData = {
  totalUnits: number;
  sharedUnits: number;
};

type Unit = {
  id: string;
  unitName: string;
  propertyAddress: string;
  tenants: number;
};

export type UnitTenant = {
  id: string;
  name: string;
  initials?: string;
  avatarUrl?: string;
  accessType: "OWNER" | "TENANT" | "MANAGER";
  isCurrentUser?: boolean;
  email?: string;
  accessLevel?: "VIEWER" | "EDITOR";
  organizationUserId?: string;
};

export type UnitDetails = {
  id: string;
  name: string;
  propertyAddress: string;
  tenants: UnitTenant[];
};

const unitNames = [
  "Suite 104",
  "Unit 7A",
  "Apartment 3B",
  "Condo 205",
  "Loft 12",
  "Studio A",
  "Unit 9C",
];
const addresses = [
  "195 Valleywood Road, Tyrone, GA 30290",
  "89 Bayfront Avenue, San Diego, CA 92101",
  "456 Oak Street, Portland, OR 97201",
  "123 Pine Avenue, Austin, TX 78701",
  "789 Maple Drive, Seattle, WA 98101",
];

export async function fetchKpiData(): Promise<KpiData> {
  const propertiesResult = await getCachedProperties();

  if (!propertiesResult.success) {
    return {
      totalUnits: 0,
      sharedUnits: 0,
    };
  }

  const { owned, shared } = propertiesResult.data;

  const ownedUnitsCount = owned.reduce(
    (sum, property) => sum + (property.units?.length ?? 0),
    0
  );

  const sharedUnitsCount = shared.reduce(
    (sum, property) => sum + (property.units?.length ?? 0),
    0
  );

  return {
    totalUnits: ownedUnitsCount + sharedUnitsCount,
    sharedUnits: sharedUnitsCount,
  };
}

export async function fetchUnits(
  page: number,
  pageSize: number = 10,
  sortBy?: string,
  sortOrder?: "asc" | "desc"
): Promise<{ data: Unit[]; total: number }> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let allUnits: Unit[] = Array.from({ length: 40 }, (_, i) => ({
    id: `${i + 1}`,
    unitName: unitNames[i % unitNames.length],
    propertyAddress: addresses[i % addresses.length],
    tenants: (i * 3) % 7,
  }));

  if (sortBy && sortOrder) {
    allUnits.sort((a, b) => {
      const aValue = a[sortBy as keyof Unit];
      const bValue = b[sortBy as keyof Unit];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    data: allUnits.slice(startIndex, endIndex),
    total: allUnits.length,
  };
}

export async function getUnitById(id: string): Promise<UnitDetails | null> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const mockTenants: UnitTenant[] = [
    {
      id: "1",
      name: "Joe Smith",
      initials: "JS",
      accessType: "OWNER",
      isCurrentUser: true,
    },
    {
      id: "2",
      name: "Jane Doe",
      avatarUrl: "https://i.pravatar.cc/150?img=1",
      accessType: "TENANT",
      isCurrentUser: false,
    },
    {
      id: "3",
      name: "April Lee",
      initials: "AL",
      accessType: "MANAGER",
      isCurrentUser: false,
    },
  ];

  const unit: UnitDetails = {
    id,
    name: unitNames[parseInt(id) % unitNames.length] || "Suite 104",
    propertyAddress: addresses[parseInt(id) % addresses.length],
    tenants: mockTenants,
  };

  return unit;
}

export type UpdateUnitData = {
  name: string;
  tenants: UnitTenant[];
};

export async function updateUnit(
  unitId: string,
  data: UpdateUnitData
): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 1000));


  return { success: true };
}
