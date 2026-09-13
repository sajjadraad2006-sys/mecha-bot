export type StaffRole =
  'PRIMARY_LECTURER' | 'CO_LECTURER' | 'LAB_INSTRUCTOR' | 'TEACHING_ASSISTANT';

export type VerificationStatus = 'VERIFIED' | 'UNVERIFIED' | 'ARCHIVED';

export interface CourseStaffAssignment {
  id: string;
  courseOfferingId: string;
  staffName: string;
  staffTitle: string | null;
  role: StaffRole;
  academicYearId: string;
  evidenceSourceId: string | null;
  verificationStatus: VerificationStatus;
  createdAt: string;
}
