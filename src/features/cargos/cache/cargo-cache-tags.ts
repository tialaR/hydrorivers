/**
 * Tags semânticas para `fetch(..., { next: { tags } })`, `revalidateTag` e `updateTag`.
 * Mantidas no domínio cargos — não usar como barrel global de todas as features.
 */
export const cargoCacheTags = {
  allCargos: 'cargos:all',
  cargoMarketplace: 'cargos:marketplace',
  userCargos: (userId: string) => `cargos:user:${userId}`,
  cargoDetail: (cargoId: string) => `cargos:detail:${cargoId}`
} as const;

/** Next.js 16+ exige perfil no 2º argumento de `revalidateTag` para tags de dados. */
export const cargoCacheRevalidateProfile = 'max' as const;
