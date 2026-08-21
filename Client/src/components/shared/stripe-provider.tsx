import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { ReactNode } from "react";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? ""
);

interface StripeProviderProps {
  clientSecret: string;
  children: ReactNode;
}

export function StripeProvider({ clientSecret, children }: StripeProviderProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#d4a843",
            colorBackground: "#0c0a09",
            colorText: "#fafaf9",
            colorDanger: "#ef4444",
            fontFamily: "Inter, system-ui, sans-serif",
            borderRadius: "12px",
            spacingUnit: "4px",
          },
          rules: {
            ".Input": {
              border: "1px solid rgba(250, 250, 250, 0.1)",
              boxShadow: "none",
              padding: "12px 14px",
            },
            ".Input:focus": {
              border: "1px solid #d4a843",
              boxShadow: "0 0 0 1px #d4a843",
            },
            ".Label": {
              fontSize: "13px",
              fontWeight: "500",
              color: "#a1a1aa",
            },
            ".Tab": {
              border: "1px solid rgba(250, 250, 250, 0.1)",
              backgroundColor: "transparent",
            },
            ".Tab:hover": {
              border: "1px solid rgba(250, 250, 250, 0.2)",
            },
            ".Tab--selected": {
              border: "1px solid #d4a843",
              backgroundColor: "rgba(212, 168, 67, 0.1)",
            },
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}
