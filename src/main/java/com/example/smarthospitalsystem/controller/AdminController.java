package com.example.smarthospitalsystem.controller;

import com.example.smarthospitalsystem.model.*;
import com.example.smarthospitalsystem.repository.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private DoctorRepository doctorRepository;
    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // Regex for Password: 8+ chars, 1 Upper, 1 Number, 1 Special
    private final String PASS_REGEX = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$";

    // --- USER MANAGEMENT (Patients & Admins) ---

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 1. Create Patient with CHECKS
    @PostMapping("/patients")
    public ResponseEntity<?> createPatient(@RequestBody UserRequest request) {
        // A. Uniqueness Check
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("{\"error\": \"Username is already taken!\"}");
        }

        // B. Password Strength Check (Added null check to prevent NPE)
        if (request.getPassword() == null || !request.getPassword().matches(PASS_REGEX)) {
            return ResponseEntity.badRequest().body("{\"error\": \"Weak Password: Needs 8+ chars, 1 Upper, 1 Number, 1 Special (!@#$%).\"}");
        }

        // Create new User entity and map the data manually
        User user = new User();
        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.PATIENT);
        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(savedUser);
    }

    // 2. Update User with CHECKS
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserRequest details) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // A. Uniqueness Check (Only if username changed)
        if (!user.getUsername().equals(details.getUsername())) {
            if (userRepository.findByUsername(details.getUsername()).isPresent()) {
                return ResponseEntity.badRequest().body("{\"error\": \"Username is already taken!\"}");
            }
        }
        user.setUsername(details.getUsername());
        user.setFullName(details.getFullName());

        // B. Password Check (Only if password is being updated)
        if (details.getPassword() != null && !details.getPassword().isEmpty()) {
            if (!details.getPassword().matches(PASS_REGEX)) {
                return ResponseEntity.badRequest().body("{\"error\": \"Weak Password: Needs 8+ chars, 1 Upper, 1 Number, 1 Special (!@#$%).\"}");
            }
            user.setPassword(passwordEncoder.encode(details.getPassword()));
        }

        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
    }

    // --- DOCTOR MANAGEMENT ---

    @GetMapping("/doctors")
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    // 3. Create Doctor with CHECKS
    @PostMapping("/doctors")
    public ResponseEntity<?> createDoctor(@Valid @RequestBody DoctorRequest request) {
        // A. Uniqueness Check
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("{\"error\": \"Username is already taken!\"}");
        }

        // B. Password Strength Check
        if (!request.getPassword().matches(PASS_REGEX)) {
            return ResponseEntity.badRequest().body("{\"error\": \"Weak Password: Needs 8+ chars, 1 Upper, 1 Number, 1 Special (!@#$%).\"}");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.DOCTOR);
        User savedUser = userRepository.save(user);

        Department dept = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        Doctor doctor = new Doctor();
        doctor.setUser(savedUser);
        doctor.setDepartment(dept);
        doctor.setSpecialization(request.getSpecialization());

        return ResponseEntity.ok(doctorRepository.save(doctor));
    }

    // 4. Update Doctor (Handles Dept/Spec/Name)
    @PutMapping("/doctors/{id}")
    public ResponseEntity<?> updateDoctor(@PathVariable Long id, @Valid @RequestBody DoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Note: We typically don't update Username/Password here (handled in updateUser),
        // but we DO update the Full Name.

        if(request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            doctor.setDepartment(dept);
        }

        if(request.getSpecialization() != null) {
            doctor.setSpecialization(request.getSpecialization());
        }

        if(request.getFullName() != null) {
            User user = doctor.getUser();
            user.setFullName(request.getFullName());
            userRepository.save(user);
        }

        return ResponseEntity.ok(doctorRepository.save(doctor));
    }

    // --- DEPARTMENT MANAGEMENT ---

    @PostMapping("/departments")
    public Department createDepartment(@RequestBody Department department) {
        return departmentRepository.save(department);
    }

    @PutMapping("/departments/{id}")
    public Department updateDepartment(@PathVariable Long id, @RequestBody Department details) {
        Department dept = departmentRepository.findById(id).orElseThrow();
        dept.setName(details.getName());
        dept.setDescription(details.getDescription());
        return departmentRepository.save(dept);
    }
    @DeleteMapping("/departments/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id) {
        // Optional: Check if doctors are assigned to this dept first
        if (!doctorRepository.findByDepartmentId(id).isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"Cannot delete: Doctors are assigned to this department.\"}");
        }

        departmentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
@lombok.Data
class UserRequest {
    private String fullName;
    private String username;
    private String password;
}