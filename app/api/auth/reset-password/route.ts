import { createClient } from "@/lib/supabase/server";
import { sendPasswordResetEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email } = await request.json();
  
  const supabase = await createClient();
  
  // Générer un token de réinitialisation
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Note: Dans un cas réel, tu devrais récupérer le token depuis la base de données
  // ou utiliser un système de tokens personnalisé
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=GENERATED_TOKEN`;
  
  // Envoyer notre propre email de réinitialisation
  try {
    await sendPasswordResetEmail({
      to: email,
      resetUrl,
      userName: "User", // Tu peux récupérer le nom depuis la DB
    });
  } catch (emailError) {
    console.error("Failed to send reset email:", emailError);
  }

  return NextResponse.json({ success: true, message: "Password reset email sent" });
}