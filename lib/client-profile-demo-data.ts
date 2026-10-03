import type { ClientProfileDetails } from "@/types/client-profile";

export const clientProfileDetails: Record<string, ClientProfileDetails> = {
  "emily-carter": {
    readinessItems: [
      { id: "consultation", label: "Consultation", value: "Complete", complete: true },
      { id: "preferences", label: "Preferences", value: "Complete", complete: true },
      { id: "inspiration", label: "Inspiration photos", value: "3 photos", complete: true },
      { id: "consent", label: "Consent", value: "Complete", complete: true },
      { id: "prep", label: "Prep", value: "Viewed", complete: true },
    ],
    preferences: [
      { id: "style", label: "Style", value: "Soft, wispy finish" },
      { id: "length", label: "Length", value: "Natural-medium" },
      { id: "appointment-feel", label: "Appointment feel", value: "Prefers a calm, minimal appointment" },
    ],
    forms: [
      { id: "consultation", label: "Consultation", status: "Complete", complete: true },
      { id: "preferences", label: "Preferences", status: "Complete", complete: true },
      { id: "consent", label: "Consent", status: "Complete", complete: true },
      { id: "prep", label: "Prep", status: "Viewed", complete: true },
      { id: "inspiration", label: "Inspiration photos", status: "3 photos", complete: true },
    ],
    visits: [],
    photos: [
      { id: "emily-inspiration", type: "Inspiration", context: "3 references" },
    ],
    notes: [
      { id: "emily-note-1", dateLabel: "Studio note", text: "Keep the finish soft through the inner corners." },
    ],
  },
  "sarah-cole": {
    readinessItems: [
      { id: "consultation", label: "Consultation", value: "Not complete", complete: false },
      { id: "preferences", label: "Preferences", value: "Complete", complete: true },
      { id: "inspiration", label: "Inspiration photos", value: "Not added", complete: false },
      { id: "consent", label: "Consent", value: "Complete", complete: true },
      { id: "prep", label: "Prep", value: "Viewed", complete: true },
    ],
    preferences: [
      { id: "shape", label: "Shape", value: "Soft, natural arch" },
      { id: "finish", label: "Finish", value: "Defined but not overly structured" },
      { id: "appointment-feel", label: "Appointment feel", value: "Likes a quick shape check before tinting" },
    ],
    forms: [
      { id: "consultation", label: "Consultation", status: "Outstanding", complete: false },
      { id: "preferences", label: "Preferences", status: "Complete", complete: true },
      { id: "consent", label: "Consent", status: "Complete", complete: true },
      { id: "prep", label: "Prep", status: "Viewed", complete: true },
      { id: "inspiration", label: "Inspiration photos", status: "Outstanding", complete: false },
    ],
    visits: [
      { id: "sarah-visit-1", date: "18 Aug 2026", service: "Brow shape + tint", summary: "Kept the front soft and followed her natural arch." },
      { id: "sarah-visit-2", date: "21 Jul 2026", service: "Brow shape", summary: "Preferred a more natural brow shape with a soft finish." },
    ],
    photos: [
      { id: "sarah-before", type: "Before", context: "Previous visit" },
      { id: "sarah-after", type: "After", context: "Previous visit" },
    ],
    notes: [
      { id: "sarah-note-1", dateLabel: "Today", text: "Check whether she wants the tint as soft as last visit." },
      { id: "sarah-note-2", dateLabel: "6 weeks ago", text: "Preferred a more natural brow shape." },
    ],
  },
  "naomi-brooks": {
    readinessItems: [
      { id: "consultation", label: "Consultation", value: "Complete", complete: true },
      { id: "preferences", label: "Preferences", value: "Complete", complete: true },
      { id: "inspiration", label: "Inspiration photos", value: "2 photos", complete: true },
      { id: "prep", label: "Prep", value: "Viewed", complete: true },
      { id: "current-photos", label: "Current photos", value: "1 photo", complete: true },
    ],
    preferences: [
      { id: "finish", label: "Finish", value: "Soft glam with luminous skin" },
      { id: "eyes", label: "Eyes", value: "Warm neutrals, softly defined" },
      { id: "appointment-feel", label: "Appointment feel", value: "Prefers a calm run-through before makeup begins" },
    ],
    forms: [
      { id: "consultation", label: "Consultation", status: "Complete", complete: true },
      { id: "preferences", label: "Preferences", status: "Complete", complete: true },
      { id: "prep", label: "Prep", status: "Viewed", complete: true },
      { id: "inspiration", label: "Inspiration photos", status: "2 photos", complete: true },
      { id: "current-photos", label: "Current photos", status: "1 photo", complete: true },
    ],
    visits: [
      { id: "naomi-visit-1", date: "28 Jun 2026", service: "Occasion makeup", summary: "Luminous base, warm neutral eyes and a soft nude lip." },
      { id: "naomi-visit-2", date: "14 Mar 2026", service: "Event makeup", summary: "Kept complexion natural and added slightly stronger eye definition." },
    ],
    photos: [
      { id: "naomi-inspiration", type: "Inspiration", context: "2 references" },
      { id: "naomi-current", type: "Current", context: "Before today’s appointment" },
    ],
    notes: [
      { id: "naomi-note-1", dateLabel: "3 months ago", text: "Keep complexion luminous rather than matte." },
    ],
  },
  "ava-james": {
    readinessItems: [
      { id: "consultation", label: "Consultation", value: "Complete", complete: true },
      { id: "preferences", label: "Preferences", value: "Complete", complete: true },
      { id: "inspiration", label: "Inspiration photos", value: "2 photos", complete: true },
      { id: "consent", label: "Consent", value: "Complete", complete: true },
      { id: "prep", label: "Prep", value: "Viewed", complete: true },
    ],
    preferences: [
      { id: "style", label: "Style", value: "Wispy with soft separation" },
      { id: "length", label: "Length", value: "Medium with gentle outer lift" },
      { id: "density", label: "Density", value: "Light-medium" },
    ],
    forms: [
      { id: "consultation", label: "Consultation", status: "Complete", complete: true },
      { id: "preferences", label: "Preferences", status: "Complete", complete: true },
      { id: "consent", label: "Consent", status: "Complete", complete: true },
      { id: "prep", label: "Prep", status: "Viewed", complete: true },
      { id: "inspiration", label: "Inspiration photos", status: "2 photos", complete: true },
    ],
    visits: [
      { id: "ava-visit-1", date: "29 Sep 2026", service: "Lash refill", summary: "Soft wispy mapping. Kept outer corners slightly longer." },
      { id: "ava-visit-2", date: "12 Sep 2026", service: "Lash refill", summary: "Natural finish with lighter density through the inner half." },
    ],
    photos: [
      { id: "ava-before", type: "Before", context: "Last visit" },
      { id: "ava-after", type: "After", context: "Last visit" },
    ],
    notes: [
      { id: "ava-note-1", dateLabel: "Yesterday", text: "Outer corners can carry a little more length without losing softness." },
    ],
  },
  "nina-patel": {
    readinessItems: [
      { id: "consultation", label: "Consultation", value: "Complete", complete: true },
      { id: "preferences", label: "Preferences", value: "Complete", complete: true },
      { id: "consent", label: "Consent", value: "Complete", complete: true },
      { id: "prep", label: "Prep", value: "Viewed", complete: true },
    ],
    preferences: [
      { id: "shape", label: "Shape", value: "Full, softly lifted arch" },
      { id: "tint", label: "Tint", value: "Natural depth, not too dark" },
      { id: "finish", label: "Finish", value: "Brushed-up but soft" },
    ],
    forms: [
      { id: "consultation", label: "Consultation", status: "Complete", complete: true },
      { id: "preferences", label: "Preferences", status: "Complete", complete: true },
      { id: "consent", label: "Consent", status: "Complete", complete: true },
      { id: "prep", label: "Prep", status: "Viewed", complete: true },
    ],
    visits: [
      { id: "nina-visit-1", date: "28 Sep 2026", service: "Brow lamination", summary: "Kept the arch full and soft with a natural tint depth." },
      { id: "nina-visit-2", date: "25 Aug 2026", service: "Brow shape + tint", summary: "Brushed-up finish with minimal cleanup underneath." },
    ],
    photos: [
      { id: "nina-before", type: "Before", context: "Last visit" },
      { id: "nina-after", type: "After", context: "Last visit" },
    ],
    notes: [
      { id: "nina-note-1", dateLabel: "Monday", text: "Avoid taking the tint too deep through the front." },
    ],
  },
  "lucy-hall": {
    readinessItems: [
      { id: "consultation", label: "Consultation", value: "Draft", complete: false },
      { id: "preferences", label: "Preferences", value: "Saved", complete: true },
      { id: "inspiration", label: "Inspiration photos", value: "Not added", complete: false },
      { id: "consent", label: "Consent", value: "Not complete", complete: false },
      { id: "prep", label: "Prep", value: "Not viewed", complete: false },
    ],
    preferences: [
      { id: "style", label: "Style", value: "Natural, softly textured" },
      { id: "length", label: "Length", value: "Short-medium" },
    ],
    forms: [
      { id: "consultation", label: "Consultation", status: "Draft", complete: false },
      { id: "preferences", label: "Preferences", status: "Saved", complete: true },
      { id: "consent", label: "Consent", status: "Not complete", complete: false },
      { id: "prep", label: "Prep", status: "Not viewed", complete: false },
      { id: "inspiration", label: "Inspiration photos", status: "Not added", complete: false },
    ],
    visits: [
      { id: "lucy-visit-1", date: "26 Sep 2026", service: "Lash refill", summary: "Kept the set light with a natural texture and short-medium length." },
    ],
    photos: [],
    notes: [
      { id: "lucy-note-1", dateLabel: "Friday", text: "Natural texture suits her best; keep density light." },
    ],
  },
};
