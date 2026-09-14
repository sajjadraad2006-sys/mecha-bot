export type Weekday =
  'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export type TimetableSlotType = 'LECTURE' | 'LAB' | 'TUTORIAL' | 'OTHER';

export type SourceStatus =
  'VERIFIED' | 'STUDENT_CONFIRMED' | 'ADMIN_ENTERED' | 'CANDIDATE' | 'OUTDATED';

export interface TimetableSlot {
  id: string;
  courseCode: string;
  courseOfferingId?: string | undefined;
  stage: number;
  programSemester: number;
  section?: string | undefined;
  subgroup?: string | undefined;
  type: TimetableSlotType;
  weekday: Weekday;
  startTime: string; // 'HH:MM' 24-hour format
  endTime: string; // 'HH:MM' 24-hour format
  room?: string | undefined;
  lecturerDisplayName?: string | undefined; // Optional metadata only, not authoritative
  validFrom?: string | undefined; // 'YYYY-MM-DD' local academic date
  validTo?: string | undefined; // 'YYYY-MM-DD' local academic date
  academicYearId?: string | undefined;
  sourceStatus: SourceStatus;
  notes?: string | undefined;
}

export type TimetableConflictType =
  'STUDENT_SCHEDULE_OVERLAP' | 'ROOM_DOUBLE_BOOKING' | 'LECTURER_DOUBLE_BOOKING';

export interface TimetableConflict {
  type: TimetableConflictType;
  reason: string;
  weekday: Weekday;
  slotA: TimetableSlot;
  slotB: TimetableSlot;
  overlapStart: string;
  overlapEnd: string;
  stage?: number | undefined;
  programSemester?: number | undefined;
  section?: string | undefined;
  subgroup?: string | undefined;
  room?: string | undefined;
  lecturer?: string | undefined;
}

export type RelativeDay = 'TODAY' | 'TOMORROW' | 'LATER';

export interface NextClassResult {
  slot: TimetableSlot;
  weekday: Weekday;
  date: string; // 'YYYY-MM-DD'
  relativeDay: RelativeDay;
  minutesUntilStart: number;
  isActive: boolean;
}

export interface TimetableQueryFilter {
  stage?: number | undefined;
  programSemester?: number | undefined;
  section?: string | undefined;
  subgroup?: string | undefined;
  weekday?: Weekday | undefined;
  date?: string | undefined; // 'YYYY-MM-DD'
  includeOutdated?: boolean | undefined;
  sourceStatuses?: SourceStatus[] | undefined;
  courseCode?: string | undefined;
  type?: TimetableSlotType | undefined;
}

export interface StudentScheduleCriteria {
  stage: number;
  programSemester: number;
  section?: string | undefined;
  subgroup?: string | undefined;
  date?: string | undefined;
  includeOutdated?: boolean | undefined;
}
