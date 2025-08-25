import { createClient } from "@/lib/supabase/server";
import { sendEmailConfirmation, sendWelcomeEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password, userName } = await request.json();
  
  const supabase = await createClient();
  
  // Créer l'utilisateur SANS envoyer l'email de confirmation Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      // Désactiver l'email automatique de Supabase
      data: {
        userName,
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data.user) {
    // Générer un token de confirmation personnalisé
    const confirmationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?token=${data.user.confirmation_token}`;
    
    // Envoyer notre propre email de confirmation
    try {
      await sendEmailConfirmation({
        to: email,
        confirmationUrl,
        userName,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }
  }

  return NextResponse.json({ success: true, message: "Please check your email to confirm your account" });
}