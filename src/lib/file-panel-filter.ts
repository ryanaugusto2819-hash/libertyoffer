type FileScope = {
  offer_id?: string | undefined;
  demand_id?: string | undefined;
  item_id?: string | undefined;
  spy_id?: string | undefined;
  spy_offer_id?: string | undefined;
  spy_section?: string | undefined;
  purpose: string;
};
type ScopedFile = {
  purpose: string;
  offer_id: string | null;
  demand_id: string | null;
  item_id: string | null;
  spy_id: string | null;
  spy_offer_id: string | null;
  spy_section: string;
};
export function matchesFilePanel(file: ScopedFile, scope: FileScope, sourceSpyId?: string | null): boolean {
  if (file.purpose !== scope.purpose) return false;
  if (scope.spy_offer_id) return file.spy_offer_id === scope.spy_offer_id && file.spy_section === scope.spy_section;
  if (scope.offer_id) return file.offer_id === scope.offer_id;
  if (scope.demand_id) return file.demand_id === scope.demand_id;
  if (scope.spy_id) return file.spy_id === scope.spy_id;
  if (!scope.item_id) return false;
  return file.item_id === scope.item_id || (scope.purpose === 'reference' && Boolean(sourceSpyId) && file.spy_id === sourceSpyId);
}