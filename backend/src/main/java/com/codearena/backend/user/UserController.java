package com.codearena.backend.user;

import com.codearena.backend.auth.ChangePasswordRequest;
import com.codearena.backend.common.ApiResponse;
import com.codearena.backend.submission.SubmissionRepository;
import com.codearena.backend.submission.SubmissionService;
import com.codearena.backend.submission.Verdict;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

        private final UserRepository userRepository;
        private final SubmissionRepository submissionRepository;
        private final SubmissionService submissionService;
        private final PasswordEncoder passwordEncoder;

        // Get public profile by username
        @GetMapping("/{username}")
        public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile(@PathVariable String username) {

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Map<String, Object> profile = buildProfile(user);
                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Profile fetched successfully", profile));
        }

        // Get current user's own profile
        @GetMapping("/me")
        public ResponseEntity<ApiResponse<Map<String, Object>>> getMyProfile() {

                String email = SecurityContextHolder.getContext()
                                .getAuthentication().getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Map<String, Object> profile = buildProfile(user);
                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Profile fetched successfully", profile));
        }

        // Update current user's profile (username and/or email)
        @PutMapping("/me")
        public ResponseEntity<ApiResponse<Map<String, Object>>> updateProfile(
                        @RequestBody Map<String, String> updates) {

                String currentEmail = SecurityContextHolder.getContext()
                                .getAuthentication().getName();
                User user = userRepository.findByEmail(currentEmail)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (updates.containsKey("username")) {
                        String newUsername = updates.get("username");
                        if (!newUsername.equals(user.getActualUsername())
                                        && userRepository.existsByUsername(newUsername)) {
                                throw new RuntimeException("Username already taken");
                        }
                        user.setUsername(newUsername);
                }

                if (updates.containsKey("email")) {
                        String newEmail = updates.get("email");
                        if (!newEmail.equals(user.getEmail())
                                        && userRepository.existsByEmail(newEmail)) {
                                throw new RuntimeException("Email already in use");
                        }
                        user.setEmail(newEmail);
                }

                userRepository.save(user);
                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Profile updated successfully",
                                                buildProfile(user)));
        }

        // Change current user's password
        @PutMapping("/me/password")
        public ResponseEntity<ApiResponse<String>> changePassword(
                        @Valid @RequestBody ChangePasswordRequest request) {

                String email = SecurityContextHolder.getContext()
                                .getAuthentication().getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (!passwordEncoder.matches(
                                request.getCurrentPassword(), user.getPassword())) {
                        throw new RuntimeException("Current password is incorrect");
                }

                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                userRepository.save(user);

                return ResponseEntity.ok(
                                ApiResponse.success("Password changed successfully", null));
        }

        // Helper - build profile map
        private Map<String, Object> buildProfile(User user) {
                long totalSolved = submissionRepository
                                .findByUserIdOrderBySubmittedAtDesc(
                                                user.getId(),
                                                org.springframework.data.domain.PageRequest.of(0, 1000))
                                .stream()
                                .filter(s -> s.getVerdict() == Verdict.ACCEPTED)
                                .map(s -> s.getProblem().getId())
                                .distinct()
                                .count();

                Map<String, Object> profile = new HashMap<>();
                profile.put("id", user.getId());
                profile.put("username", user.getActualUsername());
                profile.put("email", user.getEmail());
                profile.put("role", user.getRole());
                profile.put("totalSolved", totalSolved);
                profile.put("memberSince", user.getCreatedAt());
                return profile;
        }
}