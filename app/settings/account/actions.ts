"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const displayName = formData.get("displayName") as string;

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      display_name: displayName,
      full_name: displayName,
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings/account");
  return { success: "Profile updated successfully" };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" };
  }

  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { error: "Not authenticated" };
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    return { error: "Current password is incorrect" };
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { error: updateError.message };
  }

  return { success: "Password updated successfully" };
}

export async function signOutOtherSessions() {
  const supabase = await createClient();
  
  // Sign out from all devices except current
  const { error } = await supabase.auth.signOut({ scope: "others" });
  
  if (error) {
    return { error: error.message };
  }

  return { success: "Signed out from all other sessions" };
}