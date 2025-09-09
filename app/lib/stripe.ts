import Stripe from "stripe";

// Usa la versión por defecto del SDK instalada para evitar conflictos de tipos
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
