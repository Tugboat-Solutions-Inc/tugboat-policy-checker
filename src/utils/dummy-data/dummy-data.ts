// seed-data.ts

import { Property } from "@/features/dashboard/types/dashboard.types";

// You can import this file wherever you need mock data,
// or adapt it for a DB seed script.

export const properties2 = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    created_at: "2025-01-01T10:00:00.000Z",
    updated_at: "2025-01-01T10:00:00.000Z",
    name: "Riverside Apartments",
    address: "45 Riverside Lane, Zurich, Switzerland",
    address_place_id: "ChIJxT3sA1ZLkEcRk7G7tYl1K2s",
    owner_org_id: "aaaa0000-0000-4000-8000-000000000001",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    created_at: "2025-01-02T10:00:00.000Z",
    updated_at: "2025-01-02T10:00:00.000Z",
    name: "Sunset Villas",
    address: "221B Orchard Road, Singapore",
    address_place_id: "ChIJ-5SkEh0Z2jER7eK8BPVKxVw",
    owner_org_id: "aaaa0000-0000-4000-8000-000000000001",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    created_at: "2025-01-03T10:00:00.000Z",
    updated_at: "2025-01-03T10:00:00.000Z",
    name: "Old Town Residence",
    address: "12 Old Town Square, Prague, Czech Republic",
    address_place_id: "ChIJVTPokywDUkcRupKZDJ-3lFE",
    owner_org_id: "bbbb0000-0000-4000-8000-000000000002",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    created_at: "2025-01-04T10:00:00.000Z",
    updated_at: "2025-01-04T10:00:00.000Z",
    name: "Harbor View Lofts",
    address: "9 Dockside Street, Copenhagen, Denmark",
    address_place_id: "ChIJu46S-ZZhT0YR7MNvITxTnI4",
    owner_org_id: "bbbb0000-0000-4000-8000-000000000002",
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    created_at: "2025-01-05T10:00:00.000Z",
    updated_at: "2025-01-05T10:00:00.000Z",
    name: "Alpine Chalet",
    address: "78 Mountain Road, Innsbruck, Austria",
    address_place_id: "ChIJ2V-Mo_l1nkcRHDOd8bSDp0Q",
    owner_org_id: "aaaa0000-0000-4000-8000-000000000001",
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    created_at: "2025-01-06T10:00:00.000Z",
    updated_at: "2025-01-06T10:00:00.000Z",
    name: "City Center Flats",
    address: "10 High Street, London, United Kingdom",
    address_place_id: "ChIJdd4hrwug2EcRmSrV3Vo6llI",
    owner_org_id: "bbbb0000-0000-4000-8000-000000000002",
  },
  {
    id: "77777777-7777-4777-8777-777777777777",
    created_at: "2025-01-07T10:00:00.000Z",
    updated_at: "2025-01-07T10:00:00.000Z",
    name: "Lakeside Retreat",
    address: "5 Lake Shore Drive, Annecy, France",
    address_place_id: "ChIJnT2xN3_ZkUcR1XfWfK8lm2Y",
    owner_org_id: "aaaa0000-0000-4000-8000-000000000001",
  },
  {
    id: "88888888-8888-4888-8888-888888888888",
    created_at: "2025-01-08T10:00:00.000Z",
    updated_at: "2025-01-08T10:00:00.000Z",
    name: "Downtown Studios",
    address: "99 Main Street, New York, USA",
    address_place_id: "ChIJOwg_06VPwokRYv534QaPC8g",
    owner_org_id: "bbbb0000-0000-4000-8000-000000000002",
  },
  {
    id: "99999999-9999-4999-8999-999999999999",
    created_at: "2025-01-09T10:00:00.000Z",
    updated_at: "2025-01-09T10:00:00.000Z",
    name: "Mediterranean House",
    address: "34 Coastal Road, Barcelona, Spain",
    address_place_id: "ChIJ5TCOcRaYpBIRCmZHTz37sEQ",
    owner_org_id: "aaaa0000-0000-4000-8000-000000000001",
  },
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    created_at: "2025-01-10T10:00:00.000Z",
    updated_at: "2025-01-10T10:00:00.000Z",
    name: "Garden Courtyard",
    address: "7 Blossom Street, Amsterdam, Netherlands",
    address_place_id: "ChIJuT0C49kJxkcR6v7b2cHnKig",
    owner_org_id: "bbbb0000-0000-4000-8000-000000000002",
  },
];

export const collections = [
  // property 1
  {
    id: "c1111111-1111-4111-8111-111111111111",
    created_at: "2025-02-01T09:00:00.000Z",
    updated_at: "2025-02-01T09:00:00.000Z",
    name: "Riverside Living Room",
    description: "Furniture and decor for the main living room.",
    cover_image_url:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    // using property id as unit_id as requested
    unit_id: "11111111-1111-4111-8111-111111111111",
  },
  {
    id: "c1111111-1111-4111-8111-111111111112",
    created_at: "2025-02-01T09:10:00.000Z",
    updated_at: "2025-02-01T09:10:00.000Z",
    name: "Riverside Kitchen",
    description: "Appliances and utensils in the kitchen.",
    cover_image_url:
      "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=400",
    unit_id: "11111111-1111-4111-8111-111111111111",
  },
  {
    id: "c1111111-1111-4111-8111-111111111113",
    created_at: "2025-02-01T09:20:00.000Z",
    updated_at: "2025-02-01T09:20:00.000Z",
    name: "Riverside Bedroom",
    description: "Master bedroom furniture and decor.",
    cover_image_url:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
    unit_id: "11111111-1111-4111-8111-111111111111",
  },
  {
    id: "c1111111-1111-4111-8111-111111111114",
    created_at: "2025-02-01T09:30:00.000Z",
    updated_at: "2025-02-01T09:30:00.000Z",
    name: "Riverside Bathroom",
    description: "Bathroom fixtures and accessories.",
    cover_image_url:
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400",
    unit_id: "11111111-1111-4111-8111-111111111111",
  },

  // property 2
  {
    id: "c2222222-2222-4222-8222-222222222221",
    created_at: "2025-02-02T09:00:00.000Z",
    updated_at: "2025-02-02T09:00:00.000Z",
    name: "Sunset Villa Indoor",
    description: "Interior furniture and fixtures.",
    cover_image_url:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400",
    unit_id: "22222222-2222-4222-8222-222222222222",
  },
  {
    id: "c2222222-2222-4222-8222-222222222222",
    created_at: "2025-02-02T09:15:00.000Z",
    updated_at: "2025-02-02T09:15:00.000Z",
    name: "Sunset Villa Outdoor",
    description: "Outdoor seating and decor.",
    cover_image_url:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    unit_id: "22222222-2222-4222-8222-222222222222",
  },
  {
    id: "c2222222-2222-4222-8222-222222222223",
    created_at: "2025-02-02T09:30:00.000Z",
    updated_at: "2025-02-02T09:30:00.000Z",
    name: "Sunset Villa Master Suite",
    description: "Master bedroom suite with attached study.",
    cover_image_url:
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400",
    unit_id: "22222222-2222-4222-8222-222222222222",
  },
  {
    id: "c2222222-2222-4222-8222-222222222224",
    created_at: "2025-02-02T09:45:00.000Z",
    updated_at: "2025-02-02T09:45:00.000Z",
    name: "Sunset Villa Dining",
    description: "Formal dining room furniture and decor.",
    cover_image_url:
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400",
    unit_id: "22222222-2222-4222-8222-222222222222",
  },

  // property 3
  {
    id: "c3333333-3333-4333-8333-333333333331",
    created_at: "2025-02-03T09:00:00.000Z",
    updated_at: "2025-02-03T09:00:00.000Z",
    name: "Old Town Bedroom",
    description: "Bedroom inventory in Old Town Residence.",
    cover_image_url:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
    unit_id: "33333333-3333-4333-8333-333333333333",
  },

  // property 4
  {
    id: "c4444444-4444-4444-8444-444444444441",
    created_at: "2025-02-04T09:00:00.000Z",
    updated_at: "2025-02-04T09:00:00.000Z",
    name: "Harbor View Living",
    description: "Living and dining items in Harbor View Lofts.",
    cover_image_url:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400",
    unit_id: "44444444-4444-4444-8444-444444444444",
  },

  // property 5
  {
    id: "c5555555-5555-4555-8555-555555555551",
    created_at: "2025-02-05T09:00:00.000Z",
    updated_at: "2025-02-05T09:00:00.000Z",
    name: "Alpine Chalet Gear",
    description: "Ski gear, storage, and winter equipment.",
    cover_image_url:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400",
    unit_id: "55555555-5555-4555-8555-555555555555",
  },

  // property 6
  {
    id: "c6666666-6666-4666-8666-666666666661",
    created_at: "2025-02-06T09:00:00.000Z",
    updated_at: "2025-02-06T09:00:00.000Z",
    name: "City Center Office",
    description: "Office furniture for City Center Flats.",
    cover_image_url:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400",
    unit_id: "66666666-6666-4666-8666-666666666666",
  },

  // property 7
  {
    id: "c7777777-7777-4777-8777-777777777771",
    created_at: "2025-02-07T09:00:00.000Z",
    updated_at: "2025-02-07T09:00:00.000Z",
    name: "Lakeside Living",
    description: "Living room items for Lakeside Retreat.",
    cover_image_url:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400",
    unit_id: "77777777-7777-4777-8777-777777777777",
  },

  // property 8
  {
    id: "c8888888-8888-4888-8888-888888888881",
    created_at: "2025-02-08T09:00:00.000Z",
    updated_at: "2025-02-08T09:00:00.000Z",
    name: "Downtown Studio Main",
    description: "Core items for Downtown Studios.",
    cover_image_url:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400",
    unit_id: "88888888-8888-4888-8888-888888888888",
  },

  // property 9
  {
    id: "c9999999-9999-4999-8999-999999999991",
    created_at: "2025-02-09T09:00:00.000Z",
    updated_at: "2025-02-09T09:00:00.000Z",
    name: "Mediterranean Living",
    description: "Living area items for Mediterranean House.",
    cover_image_url:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400",
    unit_id: "99999999-9999-4999-8999-999999999999",
  },
  {
    id: "c9999999-9999-4999-8999-999999999992",
    created_at: "2025-02-09T09:30:00.000Z",
    updated_at: "2025-02-09T09:30:00.000Z",
    name: "Mediterranean Kitchen",
    description: "Kitchen appliances and utensils.",
    cover_image_url:
      "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=400",
    unit_id: "99999999-9999-4999-8999-999999999999",
  },
  {
    id: "c9999999-9999-4999-8999-999999999993",
    created_at: "2025-02-09T10:00:00.000Z",
    updated_at: "2025-02-09T10:00:00.000Z",
    name: "Mediterranean Bedroom",
    description: "Bedroom furniture and decor.",
    cover_image_url:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
    unit_id: "99999999-9999-4999-8999-999999999999",
  },

  // property 10
  {
    id: "caaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
    created_at: "2025-02-10T09:00:00.000Z",
    updated_at: "2025-02-10T09:00:00.000Z",
    name: "Garden Courtyard Essentials",
    description: "Furniture and decor in the courtyard.",
    cover_image_url:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400",
    unit_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  },
];

// items-seed.ts

const collectionIds = [
  "c1111111-1111-4111-8111-111111111111",
  "c1111111-1111-4111-8111-111111111112",
  "c2222222-2222-4222-8222-222222222221",
  "c2222222-2222-4222-8222-222222222222",
  "c3333333-3333-4333-8333-333333333331",
  "c4444444-4444-4444-8444-444444444441",
  "c5555555-5555-4555-8555-555555555551",
  "c6666666-6666-4666-8666-666666666661",
  "c7777777-7777-4777-8777-777777777771",
  "c8888888-8888-4888-8888-888888888881",
  "c9999999-9999-4999-8999-999999999991",
  "caaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
];

const itemNames = [
  "Dining Chair",
  "Coffee Table",
  "Floor Lamp",
  "Bookshelf",
  "Desk Chair",
  "Sideboard",
  "Nightstand",
  "Wardrobe",
  "Bar Stool",
  "Area Rug",
  "Wall Art",
  "Ceiling Lamp",
  "Armchair",
  "TV Cabinet",
  "Desk Lamp",
  "Kitchen Stool",
  "Bed Frame",
  "Dresser",
  "Office Chair",
  "Storage Box",
];

export const items = Array.from({ length: 200 }, (_, index) => {
  const i = index + 1; // 1..100
  const name = itemNames[index % itemNames.length];
  const baseDate = new Date("2025-03-11T10:00:00Z");
  const createdAt = new Date(baseDate.getTime() + i * 5 * 60 * 1000); // +5min per item
  const iso = createdAt.toISOString().replace(".000Z", "Z");

  const collection_id = collectionIds[index % collectionIds.length];
  const est_cost = 50 + (i % 20) * 25; // 50..525
  const est_age = Number(((i % 12) * 0.3).toFixed(1)); // 0.0..3.3
  const quantity = 1 + (i % 4); // 1..4
  const bounding_box = i % 3 === 0 ? [0.1, 0.2, 0.3, 0.4] : null;

  const slugName = name.toLowerCase().replace(/\s+/g, "-");

  return {
    id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
    created_at: iso,
    updated_at: iso,
    name,
    description: `${name} used as part of the staged interior set #${i}.`,
    model_nr: `MDL-${String(i).padStart(3, "0")}`,
    condition: "BRAND_NEW" as const,
    est_cost,
    photo_context: "",
    bounding_box,
    photo_url: `https://example.com/items/${slugName}-${i}.jpg`,
    brand_id: null,
    category_id: null,
    collection_id,
    dupe_group_id: null,
    est_age,
    quantity,
  };
});

export const sidebarProperties: Property[] = [
  {
    property_name: "My Home",
    property_address: "195 Valleywood Road, Tyrone, GA 30290",
    property_id: "1",
    ownership_type: "Owned",
  },
  {
    property_name: "NC Vacation",
    property_address: "Blue Ridge Mountains, NC",
    property_id: "2",
    ownership_type: "Owned",
  },
];

export const sharedSidebarProperties: Property[] = [
  {
    property_name: "Maplewood Heights",
    property_address: "1423 Brookstone Drive, Franklin, TN 37064",
    property_id: "3",
    ownership_type: "Shared",
  },
  {
    property_name: "Harborview Offices",
    property_address: "88 Seaside Blvd, Wilmington, NC 28401",
    property_id: "4",
    ownership_type: "Shared",
  },
  {
    property_name: "Crescent Valley Apartments",
    property_address: "501 Oak Crest Lane, Boulder, CO 80302",
    property_id: "5",
    ownership_type: "Shared",
  },
  {
    property_name: "Pinecrest Corporate Suites",
    property_address: "3200 Evergreen Parkway, Bend, OR 97701",
    property_id: "6",
    ownership_type: "Shared",
  },
  {
    property_name: "Riverside Lofts",
    property_address: "217 Riverbend Road, Savannah, GA 31401",
    property_id: "7",
    ownership_type: "Shared",
  },
  {
    property_name: "Summit Ridge Office Park",
    property_address: "900 Mountain View Drive, Reno, NV 89501",
    property_id: "8",
    ownership_type: "Shared",
  },
  {
    property_name: "Lakeshore Townhomes",
    property_address: "76 Lakewood Trail, Madison, WI 53703",
    property_id: "9",
    ownership_type: "Shared",
  },
  {
    property_name: "Brighton Innovation Center",
    property_address: "2500 Innovation Way, Austin, TX 78723",
    property_id: "10",
    ownership_type: "Shared",
  },
  {
    property_name: "Cedar Grove Residences",
    property_address: "612 Cedar Grove Blvd, Raleigh, NC 27603",
    property_id: "11",
    ownership_type: "Shared",
  },
  {
    property_name: "Northgate Business Hub",
    property_address: "133 Northgate Plaza, Columbus, OH 43215",
    property_id: "12",
    ownership_type: "Shared",
  },
];

export const testCollections = [
  {
    id: "1",
    name: "Living Room",
    description: "Living room furniture after redecorating",
    cover_image_url:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
  },
  {
    id: "2",
    name: "Kitchen",
    description: "Kitchen appliances and utensils",
    cover_image_url:
      "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=400",
  },
  {
    id: "3",
    name: "Bedroom",
    description: "Master bedroom furniture and decor",
    cover_image_url:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
  },
  {
    id: "4",
    name: "Bathroom",
    description: "Bathroom fixtures and accessories",
    cover_image_url:
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400",
  },
  {
    id: "5",
    name: "Gaming Room",
    description: "Gaming room furniture and accessories",
    cover_image_url:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
  },
  {
    id: "6",
    name: "Basement",
    description: "Basement storage and utilities",
    cover_image_url:
      "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=400",
  },
  {
    id: "7",
    name: "Attic",
    description: "Attic storage and utilities",
    cover_image_url:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
  },
  {
    id: "8",
    name: "Kids Room",
    description: "Kids room furniture and accessories",
    cover_image_url:
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400",
  },
];

export const testUsers = [
  {
    id: "user-1",
    first_name: "Alice",
    last_name: "Johnson",
    profile_picture_url:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=256&h=256&fit=crop&crop=faces",
    email: "alice.johnson@example.com",
    userType: "individual",
  },
  {
    id: "user-2",
    first_name: "Bob",
    last_name: "Smith",
    email: "bob.smith@example.com",
    userType: "individual",
  },
  {
    id: "user-3",
    first_name: "Charlie",
    last_name: "Brown",
    profile_picture_url:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=256&h=256&fit=crop&crop=faces",
    email: "charlie.brown@example.com",
    userType: "individual",
  },
  {
    id: "user-4",
    first_name: "Diana",
    last_name: "Prince",
    email: "diana.prince@example.com",
    userType: "multiTenant",
  },
  {
    id: "user-5",
    first_name: "Ethan",
    last_name: "Hunt",
    profile_picture_url:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=256&h=256&fit=crop&crop=faces",
    email: "ethan.hunt@example.com",
    userType: "individual",
  },
  {
    id: "user-6",
    first_name: "Fiona",
    last_name: "Gallagher",
    email: "fiona.gallagher@example.com",
    userType: "company",
  },
  {
    id: "user-7",
    first_name: "George",
    last_name: "Miller",
    profile_picture_url:
      "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=256&h=256&fit=crop&crop=faces",
    email: "george.miller@example.com",
    userType: "company",
  },
  {
    id: "user-8",
    first_name: "Hannah",
    last_name: "Davis",
    email: "hannah.davis@example.com",
    userType: "individual",
  },
  {
    id: "user-9",
    first_name: "Ian",
    last_name: "Wright",
    profile_picture_url:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256&h=256&fit=crop&crop=faces",
    email: "ian.wright@example.com",
    userType: "individual",
  },
  {
    id: "user-10",
    first_name: "Julia",
    last_name: "Roberts",
    email: "julia.roberts@example.com",
    userType: "multiTenant",
  },
];

export const testAreas = {
  primary_bedroom: [
    { name: "Nightstand", category: "Furniture" },
    { name: "Shoes - Ladies' - Dress", category: "Women's Accessories" },
    {
      name: "Laptop/Notebook computer - 15 inch and above",
      category: "Appliances / Electronics",
    },
    { name: "Blanket", category: "Linens" },
    { name: "Headboard / Footboard", category: "Furniture" },
    { name: "Curtains / drapes", category: "Curtains / drapes" },
    {
      name: "Cosmetic bag / vanity / toiletry case",
      category: "Women's Accessories",
    },
    {
      name: "TV - LCD / LED-LCD 30–39 in.",
      category: "Appliances / Electronics",
    },
    { name: "Dresser", category: "Furniture" },
    { name: "Bed frame", category: "Furniture" },
    { name: "Mattress - Queen", category: "Furniture" },
    { name: "Pillows (set of 2)", category: "Linens" },
    { name: "Jewelry box", category: "Women's Accessories" },
    { name: "Mirror - wall", category: "Decorative Items / Accents" },
    { name: "Lamp - bedside", category: "Furniture" },
    { name: "Shoe rack", category: "Furniture" },
    { name: "Laundry hamper", category: "Other" },
    { name: "Rug - area", category: "Decorative Items / Accents" },
  ],

  outdoor: [
    {
      name: "VHS / VCR & DVD recorder",
      category: "Decorative Items / Accents",
    },
    {
      name: "Decorative/Storage Wicker Basket",
      category: "Decorative Items / Accents",
    },
    { name: "Lithograph", category: "Wall Art / Decor" },
    { name: "Holster/Sling", category: "Accessories" },
    { name: "Trap & skeet thrower", category: "Accessories" },
    { name: "Shooting target", category: "Accessories" },
    { name: "Ethernet Cable - 6 ft", category: "Appliances / Electronics" },
    { name: "Fan - Tower", category: "Appliances / Electronics" },
    { name: "Patio chair", category: "Furniture" },
    { name: "Garden hose - 50 ft", category: "Tools / Outdoor Equipment" },
    { name: "BBQ Grill - gas", category: "Appliances / Electronics" },
    { name: "Cooler - large", category: "Accessories" },
    { name: "Outdoor storage bin", category: "Furniture" },
    { name: "Lawn mower - electric", category: "Tools / Outdoor Equipment" },
    { name: "Leaf blower", category: "Tools / Outdoor Equipment" },
  ],

  office: [
    { name: "Printer - Laser", category: "Appliances / Electronics" },
    { name: "Office Chair", category: "Furniture" },
    { name: "Desk - wooden", category: "Furniture" },
    {
      name: "Laptop computer - 13–15 inch",
      category: "Appliances / Electronics",
    },
    { name: "File Cabinet - 2 drawer", category: "Furniture" },
    { name: "Wall Clock", category: "Decorative Items / Accents" },
    { name: "Whiteboard", category: "Wall Art / Decor" },
    { name: "Bookshelf", category: "Furniture" },
    { name: "HDMI Cable - 6 ft", category: "Appliances / Electronics" },
    { name: "Tablet - 10 inch", category: "Appliances / Electronics" },
    { name: "Desk Lamp", category: "Furniture" },
    {
      name: "Router / Wi-Fi Access Point",
      category: "Appliances / Electronics",
    },
    { name: "Keyboard - wireless", category: "Appliances / Electronics" },
    { name: "Mouse - wireless", category: "Appliances / Electronics" },
    { name: "Document organizer tray", category: "Accessories" },
  ],

  kitchen: [
    { name: "Microwave oven", category: "Appliances / Electronics" },
    { name: "Toaster - 2 slice", category: "Appliances / Electronics" },
    { name: "Cutlery set - 12 pcs", category: "Kitchenware" },
    { name: "Dinner plates - 6 pcs", category: "Kitchenware" },
    { name: "Wine glasses - 4 pcs", category: "Kitchenware" },
    { name: "Cooking pans - set of 3", category: "Kitchenware" },
    { name: "Electric kettle", category: "Appliances / Electronics" },
    { name: "Blender", category: "Appliances / Electronics" },
    { name: "Kitchen rug", category: "Decorative Items / Accents" },
    { name: "Utensil holder", category: "Kitchenware" },
    { name: "Storage containers - set of 5", category: "Kitchenware" },
  ],

  living_room: [
    { name: "Sofa - 3 seat", category: "Furniture" },
    { name: "Coffee table", category: "Furniture" },
    { name: "Area rug - 6×8 ft", category: "Decorative Items / Accents" },
    { name: "Throw blanket", category: "Linens" },
    {
      name: "TV - LCD / LED-LCD 50–59 in.",
      category: "Appliances / Electronics",
    },
    { name: "Floor lamp", category: "Furniture" },
    { name: "Curtains / drapes", category: "Curtains / drapes" },
    { name: "Wall art - framed print", category: "Wall Art / Decor" },
    { name: "Bluetooth speaker", category: "Appliances / Electronics" },
    {
      name: "Decorative pillows - set of 3",
      category: "Decorative Items / Accents",
    },
  ],

  garage: [
    { name: "Toolbox - metal", category: "Tools / Outdoor Equipment" },
    { name: "Drill - cordless", category: "Tools / Outdoor Equipment" },
    { name: "Extension cord - 25 ft", category: "Tools / Outdoor Equipment" },
    { name: "Bike - mountain", category: "Sporting Goods" },
    { name: "Storage racks - wall mounted", category: "Furniture" },
    { name: "Car cleaning kit", category: "Accessories" },
    { name: "Air compressor", category: "Tools / Outdoor Equipment" },
    { name: "Ladder - 6 ft", category: "Tools / Outdoor Equipment" },
  ],
};
