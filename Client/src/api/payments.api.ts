import { apiClient } from "./client";

export async function createPaymentIntent(data: {
  showtimeId: string;
  selectedSeats: string[];
}): Promise<{ clientSecret: string; bookingId: string }> {
  const seatNumbers = data.selectedSeats.map((s) =>
    parseInt(s.replace(/[A-Za-z]/g, ""), 10)
  );

  const { data: res } = await apiClient.post("/payments/create-intent", {
    showtimeId: data.showtimeId,
    selectedSeats: seatNumbers,
  });

  return res.data;
}

export async function getPaymentStatus(
  bookingId: string
): Promise<{ status: string; paid: boolean }> {
  const { data: res } = await apiClient.get(
    `/payments/status/${bookingId}`
  );
  return res.data;
}
