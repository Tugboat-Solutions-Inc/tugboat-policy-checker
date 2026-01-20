"use server";

import { revalidatePath } from "next/cache";
import { API_ENDPOINTS } from "@/config/api";
import { ROUTES } from "@/config/routes";
import { fetchWithAuth, type ActionResult } from "@/lib/fetch-with-auth";
import type { Brand, GetBrandsResponse } from "../types/brand.types";

type CreateBrandData = {
  name: string;
};

export async function createBrand(
  propertyId: string,
  unitId: string,
  data: CreateBrandData
): Promise<ActionResult<Brand>> {
  const result = await fetchWithAuth<Brand>(
    API_ENDPOINTS.PROPERTIES.BRANDS(propertyId, unitId),
    {
      method: "POST",
      body: data,
      errorPrefix: "Failed to create brand",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId));
  }

  return result;
}

export async function updateBrand(
  propertyId: string,
  unitId: string,
  brandId: string,
  data: CreateBrandData
): Promise<ActionResult<Brand>> {
  const result = await fetchWithAuth<Brand>(
    API_ENDPOINTS.PROPERTIES.BRANDS_UPDATE(propertyId, brandId, unitId),
    {
      method: "PUT",
      body: data,
      errorPrefix: "Failed to update brand",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId));
  }

  return result;
}

export async function getBrands(
  propertyId: string,
  unitId: string,
  page?: number,
  page_size?: number
): Promise<ActionResult<GetBrandsResponse>> {
  const queryParams = new URLSearchParams();
  if (page !== undefined) queryParams.append("page", String(page));
  if (page_size !== undefined)
    queryParams.append("page_size", String(page_size));

  const url = `${API_ENDPOINTS.PROPERTIES.BRANDS(propertyId, unitId)}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return fetchWithAuth<GetBrandsResponse>(url, {
    errorPrefix: "Failed to fetch brands",
  });
}

export async function deleteBrand(
  propertyId: string,
  unitId: string,
  brandId: string
): Promise<ActionResult<null>> {
  const result = await fetchWithAuth<null>(
    API_ENDPOINTS.PROPERTIES.BRANDS_UPDATE(propertyId, brandId, unitId),
    {
      method: "DELETE",
      errorPrefix: "Failed to delete brand",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId));
  }

  return result;
}
