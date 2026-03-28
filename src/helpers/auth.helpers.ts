import { ApiResponse, User } from "../types/api";

export type ApiEnvelope<T> = ApiResponse<T> | T;

export function unwrap<T>(payload: ApiEnvelope<T>): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
}

export function normalizeUser(user: User): User {
  return {
    ...user,
    memberships: user.memberships ?? [],
    isActive: user.isActive ?? true,
    updatedAt: user.updatedAt ?? user.createdAt,
  };
}
