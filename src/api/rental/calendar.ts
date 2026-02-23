import { API_BASE_URL, buildQuery, parseJson } from "../client";
import type { Availability } from "./types";

export type GetAvailabilityParams = {
  itemId: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
};

export async function getItemAvailability({
  itemId,
  startDate,
  endDate,
}: GetAvailabilityParams): Promise<Availability[]> {
  const qs = buildQuery({ startDate, endDate });
  const res = await fetch(
    `${API_BASE_URL}/api/items/${itemId}/availability${qs}`,
  );
  return parseJson<Availability[]>(res);
}
