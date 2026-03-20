import { API_BASE_URL, buildQuery, parseJson } from "../client";
import axiosInstance from "../axiosInstance";
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

// GET /api/admin/holidays/calendar
export type HolidayType = "WEEKEND" | "HOLIDAY";

export type HolidayCalendarItem = {
  date: string; // YYYY-MM-DD
  type: HolidayType;
  description?: string;
};

export type HolidayCalendarResponse = {
  year: number;
  month: number;
  holidays: HolidayCalendarItem[];
};

export async function getHolidayCalendar(params: {
  year: number;
  month: number;
}): Promise<HolidayCalendarResponse> {
  const response = await axiosInstance.get("/api/admin/holidays/calendar", {
    params,
  });
  return response.data;
}
