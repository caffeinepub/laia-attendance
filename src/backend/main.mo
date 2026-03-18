import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Int "mo:core/Int";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type Village = {
    id : Nat;
    name : Text;
  };

  public type TeacherProfile = {
    userId : Principal.Principal;
    villageId : Nat;
    name : Text;
    email : Text;
  };

  public type Student = {
    id : Nat;
    villageId : Nat;
    name : Text;
    rollNo : Text;
    isActive : Bool;
  };

  public type AttendanceSession = {
    id : Nat;
    villageId : Nat;
    teacherId : Principal.Principal;
    date : Text;
    photoUrl : Text;
    timestamp : Int;
  };

  public type AttendanceRecord = {
    sessionId : Nat;
    studentId : Nat;
    status : Text;
  };

  public type AttendanceInput = {
    studentId : Nat;
    status : Text;
  };

  public type VillageStats = {
    totalSessions : Nat;
    studentCount : Nat;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  // State
  var nextVillageId = 1;
  var nextStudentId = 1;
  var nextSessionId = 1;

  let villages = Map.empty<Nat, Village>();
  let students = Map.empty<Nat, Student>();
  let teachers = Map.empty<Principal.Principal, TeacherProfile>();
  let sessions = Map.empty<Nat, AttendanceSession>();
  let records = List.empty<AttendanceRecord>();
  let userProfiles = Map.empty<Principal.Principal, UserProfile>();

  // Results
  public type Result = {
    #ok;
    #err : Text;
  };

  func isTeacherInSystem(userId : Principal.Principal) : Bool {
    switch (teachers.get(userId)) {
      case (?_) { true };
      case (null) { false };
    };
  };

  func getTeacherProfileInternal(userId : Principal.Principal) : ?TeacherProfile {
    teachers.get(userId);
  };

  func getVillageInternal(id : Nat) : ?Village {
    villages.get(id);
  };

  // Admin Functions
  public shared ({ caller }) func createVillage(name : Text) : async Result {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let village : Village = {
      id = nextVillageId;
      name;
    };

    villages.add(nextVillageId, village);
    nextVillageId += 1;

    #ok;
  };

  public query ({ caller }) func getAllVillages() : async [Village] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    villages.values().toArray();
  };

  public shared ({ caller }) func addStudent(villageId : Nat, name : Text, rollNo : Text) : async Result {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let student : Student = {
      id = nextStudentId;
      villageId;
      name;
      rollNo;
      isActive = true;
    };

    students.add(nextStudentId, student);
    nextStudentId += 1;

    #ok;
  };

  public query ({ caller }) func getStudents(villageId : Nat) : async [Student] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    students.values().toArray().filter(
      func(student) {
        student.villageId == villageId and student.isActive
      }
    );
  };

  public shared ({ caller }) func deleteStudent(studentId : Nat) : async Result {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (students.get(studentId)) {
      case (?student) {
        let updatedStudent : Student = { student with isActive = false };
        students.add(studentId, updatedStudent);
        #ok;
      };
      case (null) { #err("Student not found") };
    };
  };

  public shared ({ caller }) func assignTeacher(userId : Principal.Principal, villageId : Nat, name : Text, email : Text) : async Result {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let profile : TeacherProfile = {
      userId;
      villageId;
      name;
      email;
    };

    teachers.add(userId, profile);

    #ok;
  };

  public query ({ caller }) func getTeachers() : async [TeacherProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    teachers.values().toArray();
  };

  public query ({ caller }) func getVillageStats(villageId : Nat) : async VillageStats {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let totalSessions = sessions.values().toArray().filter(func(s) { s.villageId == villageId }).size();
    let studentCount = students.values().toArray().filter(func(s) { s.villageId == villageId and s.isActive }).size();

    { totalSessions; studentCount };
  };

  public query ({ caller }) func getAllSessions() : async [AttendanceSession] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    sessions.values().toArray();
  };

  // Teacher Functions
  public query ({ caller }) func getMyVillage() : async Village {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (getTeacherProfileInternal(caller)) {
      case (?profile) {
        switch (getVillageInternal(profile.villageId)) {
          case (?village) { village };
          case (null) { Runtime.trap("Village not found") };
        };
      };
      case (null) { Runtime.trap("Teacher profile not found") };
    };
  };

  public query ({ caller }) func getMyStudents() : async [Student] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (getTeacherProfileInternal(caller)) {
      case (?profile) {
        students.values().toArray().filter(func(student) { 
          student.villageId == profile.villageId and student.isActive 
        });
      };
      case (null) { Runtime.trap("Teacher profile not found") };
    };
  };

  public shared ({ caller }) func submitAttendance(date : Text, photoUrl : Text, recordsInput : [AttendanceInput]) : async Result {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    // Verify caller is a teacher
    switch (getTeacherProfileInternal(caller)) {
      case (?profile) {
        let villageId = profile.villageId;

        // Verify all students belong to the teacher's village
        for (record in recordsInput.values()) {
          switch (students.get(record.studentId)) {
            case (?student) {
              if (student.villageId != villageId) {
                return #err("Student does not belong to your village");
              };
            };
            case (null) {
              return #err("Student not found");
            };
          };
        };

        let session : AttendanceSession = {
          id = nextSessionId;
          villageId;
          teacherId = caller;
          date;
          photoUrl;
          timestamp = Time.now();
        };

        sessions.add(nextSessionId, session);

        for (record in recordsInput.values()) {
          let attendanceRecord : AttendanceRecord = {
            sessionId = nextSessionId;
            studentId = record.studentId;
            status = record.status;
          };
          records.add(attendanceRecord);
        };

        nextSessionId += 1;
        #ok;
      };
      case (null) {
        #err("Teacher profile not found");
      };
    };
  };

  // Shared Functions
  public query ({ caller }) func getSessions(villageId : Nat) : async [AttendanceSession] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    // Teachers can only see their own village sessions
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      switch (getTeacherProfileInternal(caller)) {
        case (?profile) {
          if (profile.villageId != villageId) {
            Runtime.trap("Unauthorized: Can only view sessions from your village");
          };
        };
        case (null) {
          Runtime.trap("Teacher profile not found");
        };
      };
    };

    sessions.values().toArray().filter(func(session) { session.villageId == villageId });
  };

  public query ({ caller }) func getSessionRecords(sessionId : Nat) : async [AttendanceRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    // Teachers can only see records from their village sessions
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      switch (sessions.get(sessionId)) {
        case (?session) {
          switch (getTeacherProfileInternal(caller)) {
            case (?profile) {
              if (session.villageId != profile.villageId) {
                Runtime.trap("Unauthorized: Can only view records from your village");
              };
            };
            case (null) {
              Runtime.trap("Teacher profile not found");
            };
          };
        };
        case (null) {
          Runtime.trap("Session not found");
        };
      };
    };

    records.toArray().filter(func(record) { record.sessionId == sessionId });
  };
};
