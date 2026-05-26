package com.codearena.backend.user;

import com.codearena.backend.common.ApiResponse;
import com.codearena.backend.submission.SubmissionResponse;
import com.codearena.backend.submission.SubmissionService;
import com.codearena.backend.submission.Verdict;
import com.codearena.backend.submission.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
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

    // Update current user's profile
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProfile(
            @RequestBody Map<String, String> updates) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("username")) {
            String newUsername = updates.get("username");
            if (!newUsername.equals(user.getActualUsername())
                    && userRepository.existsByUsername(
                            newUsername)) {
                throw new RuntimeException(
                        "Username already taken");
            }
            user.setUsername(newUsername);
        }

        userRepository.save(user);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Profile updated successfully",
                        buildProfile(user)));
    }

    // Helper - build profile map
    private Map<String, Object> buildProfile(User user) {
        List<com.codearena.backend.submission.Submission> submissions = submissionRepository
                .findByProblemIdOrderBySubmittedAtDesc(
                        user.getId());

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