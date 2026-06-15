package com.codearena.backend.admin;

import com.codearena.backend.common.ApiResponse;
import com.codearena.backend.problem.Problem;
import com.codearena.backend.problem.ProblemRepository;
import com.codearena.backend.submission.SubmissionRepository;
import com.codearena.backend.user.User;
import com.codearena.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;
import com.codearena.backend.user.Role;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

        private final UserRepository userRepository;
        private final ProblemRepository problemRepository;
        private final SubmissionRepository submissionRepository;

        // Platform statistics
        @GetMapping("/stats")
        public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
                Map<String, Object> stats = new HashMap<>();
                stats.put("totalUsers",
                                userRepository.count());
                stats.put("totalProblems",
                                problemRepository.count());
                stats.put("totalSubmissions",
                                submissionRepository.count());
                stats.put("activeProblems",
                                problemRepository.findByIsActiveTrue(
                                                PageRequest.of(0, 1)).getTotalElements());
                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Stats fetched successfully", stats));
        }

        // Get all users
        @GetMapping("/users")
        public ResponseEntity<ApiResponse<Page<Map<String, Object>>>> getAllUsers(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                Page<Map<String, Object>> users = userRepository
                                .findAll(PageRequest.of(page, size,
                                                Sort.by("createdAt").descending()))
                                .map(user -> {
                                        Map<String, Object> u = new HashMap<>();
                                        u.put("id", user.getId());
                                        u.put("username", user.getActualUsername());
                                        u.put("email", user.getEmail());
                                        u.put("role", user.getRole());
                                        u.put("isActive", user.isActive());
                                        u.put("createdAt", user.getCreatedAt());
                                        return u;
                                });
                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Users fetched successfully", users));
        }

        // Deactivate user
        @PutMapping("/users/{id}/deactivate")
        public ResponseEntity<ApiResponse<Void>> deactivateUser(
                        @PathVariable Long id) {
                User user = userRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                String currentEmail = SecurityContextHolder.getContext()
                                .getAuthentication().getName();
                User currentAdmin = userRepository.findByEmail(currentEmail)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (user.getId().equals(currentAdmin.getId())) {
                        throw new RuntimeException("You cannot deactivate your own account");
                }

                if (user.getRole() == Role.ADMIN) {
                        throw new RuntimeException("Cannot deactivate another admin");
                }

                user.setActive(false);
                userRepository.save(user);
                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "User deactivated successfully", null));
        }

        // Activate user
        @PutMapping("/users/{id}/activate")
        public ResponseEntity<ApiResponse<Void>> activateUser(
                        @PathVariable Long id) {
                User user = userRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                user.setActive(true);
                userRepository.save(user);
                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "User activated successfully", null));
        }

        // Promote user to admin
        @PutMapping("/users/{id}/promote")
        public ResponseEntity<ApiResponse<Void>> promoteUser(
                        @PathVariable Long id) {
                User user = userRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                user.setRole(com.codearena.backend.user.Role.ADMIN);
                userRepository.save(user);
                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "User promoted to admin successfully",
                                                null));
        }

        // Get all submissions (admin view)
        @GetMapping("/submissions")
        public ResponseEntity<ApiResponse<Page<Map<String, Object>>>> getAllSubmissions(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {

                Page<Map<String, Object>> submissions = submissionRepository
                                .findAll(PageRequest.of(page, size,
                                                Sort.by("submittedAt").descending()))
                                .map(s -> {
                                        Map<String, Object> sub = new HashMap<>();
                                        sub.put("id", s.getId());
                                        sub.put("username",
                                                        s.getUser().getActualUsername());
                                        sub.put("problemTitle",
                                                        s.getProblem().getTitle());
                                        sub.put("language", s.getLanguage());
                                        sub.put("verdict", s.getVerdict());
                                        sub.put("runtimeMs", s.getRuntimeMs());
                                        sub.put("submittedAt", s.getSubmittedAt());
                                        return sub;
                                });

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Submissions fetched successfully",
                                                submissions));
        }
}