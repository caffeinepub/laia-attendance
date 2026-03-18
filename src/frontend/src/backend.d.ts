import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Student {
    id: bigint;
    name: string;
    isActive: boolean;
    villageId: bigint;
    rollNo: string;
}
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export interface Village {
    id: bigint;
    name: string;
}
export interface AttendanceSession {
    id: bigint;
    date: string;
    photoUrl: string;
    villageId: bigint;
    teacherId: Principal;
    timestamp: bigint;
}
export interface VillageStats {
    totalSessions: bigint;
    studentCount: bigint;
}
export type Principal = Principal;
export interface AttendanceInput {
    status: string;
    studentId: bigint;
}
export interface AttendanceRecord {
    status: string;
    studentId: bigint;
    sessionId: bigint;
}
export interface TeacherProfile {
    userId: Principal;
    name: string;
    email: string;
    villageId: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addStudent(villageId: bigint, name: string, rollNo: string): Promise<Result>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignTeacher(userId: Principal, villageId: bigint, name: string, email: string): Promise<Result>;
    createVillage(name: string): Promise<Result>;
    deleteStudent(studentId: bigint): Promise<Result>;
    getAllSessions(): Promise<Array<AttendanceSession>>;
    getAllVillages(): Promise<Array<Village>>;
    getCallerUserRole(): Promise<UserRole>;
    getMyStudents(): Promise<Array<Student>>;
    getMyVillage(): Promise<Village>;
    getSessionRecords(sessionId: bigint): Promise<Array<AttendanceRecord>>;
    getSessions(villageId: bigint): Promise<Array<AttendanceSession>>;
    getStudents(villageId: bigint): Promise<Array<Student>>;
    getTeachers(): Promise<Array<TeacherProfile>>;
    getVillageStats(villageId: bigint): Promise<VillageStats>;
    isCallerAdmin(): Promise<boolean>;
    submitAttendance(date: string, photoUrl: string, recordsInput: Array<AttendanceInput>): Promise<Result>;
}
