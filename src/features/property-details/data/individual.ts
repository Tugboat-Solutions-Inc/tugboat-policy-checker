import {
  PropertyDetails,
  PropertyDataProvider,
  RoleType,
} from "../types/property-details.types";

const mockPropertyData: PropertyDetails = {
  id: "prop-individual-1",
  name: "Sunset Villa",
  address: "195 Valleywood Road, Tyrone, GA 30290",
  users: [
    {
      id: "user-1",
      name: "Joe Smith",
      email: "joe.smith@email.com",
      initials: "JS",
      role: "OWNER",
      isCurrentUser: true,
    },
  ],
};

export const fetchPropertyDetails = async (
  id: string
): Promise<PropertyDetails> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { ...mockPropertyData, id };
};

export const updateProperty = async (
  id: string,
  payload: Partial<PropertyDetails>
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
};

export const deleteProperty = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
};

export const inviteUser = async (
  propertyId: string,
  payload: { email: string; role: RoleType }
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
};

export const removeUser = async (
  propertyId: string,
  userId: string
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
};

export const updateUserRole = async (
  propertyId: string,
  userId: string,
  role: RoleType
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
};

const individualProvider: PropertyDataProvider = {
  fetchPropertyDetails,
  updateProperty,
  deleteProperty,
  inviteUser,
  removeUser,
  updateUserRole,
};

export default individualProvider;
