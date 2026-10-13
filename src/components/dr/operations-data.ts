import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getOperations } from '@/lib/operations.functions';
export function useOperations(area:'spy'|'creative'|'finance'|'notifications'){const fetch=useServerFn(getOperations);return useQuery({queryKey:['operations',area],queryFn:()=>fetch({data:area}),staleTime:60000,refetchInterval:area==='notifications'?60000:false});}