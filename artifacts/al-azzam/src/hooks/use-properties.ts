import { 
  useGetProperties, 
  useGetProperty, 
  useCreateProperty, 
  useUpdateProperty, 
  useDeleteProperty,
  type GetPropertiesParams,
  type CreatePropertyRequest,
  type UpdatePropertyRequest
} from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

export function usePropertiesList(params?: GetPropertiesParams) {
  return useGetProperties(params, { request: { headers: getAuthHeaders() } });
}

export function usePropertyDetail(id: number) {
  return useGetProperty(id, { request: { headers: getAuthHeaders() } });
}

export function useCreatePropertyMutation() {
  const queryClient = useQueryClient();
  return useCreateProperty({
    request: { headers: getAuthHeaders() },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
        queryClient.invalidateQueries({ queryKey: ['/api/bookings/stats'] });
      }
    }
  });
}

export function useUpdatePropertyMutation() {
  const queryClient = useQueryClient();
  return useUpdateProperty({
    request: { headers: getAuthHeaders() },
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
        queryClient.invalidateQueries({ queryKey: [`/api/properties/${variables.id}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/bookings/stats'] });
      }
    }
  });
}

export function useDeletePropertyMutation() {
  const queryClient = useQueryClient();
  return useDeleteProperty({
    request: { headers: getAuthHeaders() },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
        queryClient.invalidateQueries({ queryKey: ['/api/bookings/stats'] });
      }
    }
  });
}
