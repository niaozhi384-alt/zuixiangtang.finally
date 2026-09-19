import type { RegistrationWindow } from "@/lib/storage";

export interface RegistrationWindowStatus {
  open: boolean;
  message: string | null;
}

export function registrationWindowStatus(
  window: RegistrationWindow,
  now = Date.now()
): RegistrationWindowStatus {
  const start = window.startAt ? new Date(window.startAt).getTime() : null;
  const end = window.endAt ? new Date(window.endAt).getTime() : null;
  if (start !== null && now < start) {
    return { open: false, message: "报名尚未开始" };
  }
  if (end !== null && now > end) {
    return { open: false, message: "报名已结束" };
  }
  return { open: true, message: null };
}
