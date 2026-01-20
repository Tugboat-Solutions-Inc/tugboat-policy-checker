import {
  PropertyDetails,
  PropertyDataProvider,
  RoleType,
} from "../types/property-details.types";

const mockPropertyData: PropertyDetails = {
  id: "prop-company-1",
  name: "Harborview Loft",
  address: "89 Bayfront Avenue, San Diego, CA 92101",
  users: [
    {
      id: "user-1",
      name: "Joe Smith",
      email: "joe.smith@email.com",
      initials: "JS",
      role: "ADMIN",
      companyName: "Contents Restoration Services",
      isCurrentUser: true,
    },
    {
      id: "user-2",
      name: "Alice Johnson",
      email: "alice.johnson@email.com",
      initials: "AJ",
      role: "TEAM_MEMBER",
      companyName: "Contents Restoration Services",
    },
    {
      id: "user-3",
      name: "Jane Doe",
      email: "jane.doe@email.com",
      avatarUrl: "/images/auth-side-image.jpg",
      role: "CAN_VIEW",
    },
    {
      id: "user-4",
      name: "April Lee",
      email: "april.lee@email.com",
      initials: "AL",
      role: "CAN_EDIT",
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

const companyProvider: PropertyDataProvider = {
  fetchPropertyDetails,
  updateProperty,
  deleteProperty,
  inviteUser,
  removeUser,
  updateUserRole,
};

export default companyProvider;
