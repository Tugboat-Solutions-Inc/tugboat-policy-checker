import { PropertiesTable } from "./properties-table";
import type { Property } from "@/features/auth/types/property.types";
import type { TableProperty } from "../../types/company-dashboard.types";

interface PropertiesTableWrapperProps {
  properties: Property[];
}

function mapPropertiesToTableProperties(properties: Property[]): TableProperty[] {
  return properties.map((property) => ({
    id: property.id,
    propertyName: property.name,
    propertyAddress: property.address,
    clients: property.accesses?.filter((access) => access.is_client).length ?? 0,
  }));
}

export function PropertiesTableWrapper({ properties }: PropertiesTableWrapperProps) {
  const mappedProperties = mapPropertiesToTableProperties(properties);

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      <PropertiesTable properties={mappedProperties} />
    </div>
  );
}
