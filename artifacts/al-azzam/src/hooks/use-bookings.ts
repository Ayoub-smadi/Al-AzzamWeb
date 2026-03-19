import { 
  useGetBookings, 
  useCreateBooking, 
  useDeleteBooking, 
  useGetStats,
  type GetBookingsParams 
} from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

export function useBookingsList(params?: GetBookingsParams) {
  return useGetBookings(params, { request: { headers: getAuthHeaders() } });
}

export function useDashboardStats() {
  return useGetStats({ request: { headers: getAuthHeaders() } });
}

export function useCreateBookingMutation() {
  return useCreateBooking({ request: { headers: getAuthHeaders() } });
}

export function useDeleteBookingMutation() {
  const queryClient = useQueryClient();
  return useDeleteBooking({
    request: { headers: getAuthHeaders() },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
        queryClient.invalidateQueries({ queryKey: ['/api/bookings/stats'] });
      }
    }
  });
}
