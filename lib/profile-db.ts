// Profile database module
// Using in-memory database for development, can be replaced with PostgreSQL

interface UserProfile {
  id: string;
  phone: string;
  name: string;
  email?: string;
  bankAccount?: string;
  address?: string;
  city?: string;
  state?: string;
  profileImage?: string;
  userType?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory database (replace with real DB in production)
let profiles: UserProfile[] = [];

export async function createUserProfile(phone: string, data: Partial<UserProfile>): Promise<UserProfile> {
  console.log(`📋 Creating profile for phone: ${phone}`);
  
  const profile: UserProfile = {
    id: `profile_${Date.now()}`,
    phone,
    name: data.name || 'User',
    email: data.email,
    bankAccount: data.bankAccount,
    address: data.address,
    city: data.city,
    state: data.state,
    profileImage: data.profileImage,
    userType: data.userType,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  profiles.push(profile);
  
  console.log(`✅ Profile created for ${phone}:`, profile);
  return profile;
}

export async function getUserProfile(phone: string): Promise<UserProfile | null> {
  console.log(`🔍 Fetching profile for phone: ${phone}`);
  
  const profile = profiles.find(p => p.phone === phone);
  
  if (profile) {
    console.log(`✅ Profile found for ${phone}:`, profile);
  } else {
    console.log(`❌ No profile found for ${phone}`);
  }

  return profile || null;
}

export async function updateUserProfile(
  phone: string,
  data: Partial<UserProfile>
): Promise<UserProfile | null> {
  console.log(`📝 Updating profile for phone: ${phone}`);
  
  const profileIndex = profiles.findIndex(p => p.phone === phone);
  
  if (profileIndex === -1) {
    console.log(`❌ Profile not found for ${phone}`);
    return null;
  }

  const updatedProfile: UserProfile = {
    ...profiles[profileIndex],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  profiles[profileIndex] = updatedProfile;
  
  console.log(`✅ Profile updated for ${phone}:`, updatedProfile);
  return updatedProfile;
}

export async function deleteUserProfile(phone: string): Promise<boolean> {
  console.log(`🗑️ Deleting profile for phone: ${phone}`);
  
  const profileIndex = profiles.findIndex(p => p.phone === phone);
  
  if (profileIndex === -1) {
    console.log(`❌ Profile not found for ${phone}`);
    return false;
  }

  profiles.splice(profileIndex, 1);
  console.log(`✅ Profile deleted for ${phone}`);
  return true;
}

export async function getAllProfiles(): Promise<UserProfile[]> {
  return profiles;
}

export async function getProfiles(userType: string): Promise<UserProfile[]> {
  return profiles.filter(p => p.userType === userType);
}
