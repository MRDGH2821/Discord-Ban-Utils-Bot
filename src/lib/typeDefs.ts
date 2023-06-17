export type BanEntity = string;
export type BanEntityWithReason = { id: string; reason: string | null | undefined };
export type BanType = BanEntity | BanEntityWithReason;
