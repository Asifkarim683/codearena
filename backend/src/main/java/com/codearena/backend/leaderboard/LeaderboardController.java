package com.codearena.backend.leaderboard;

import com.codearena.backend.common.ApiResponse;
import com.codearena.backend.submission.SubmissionRepository;
import com.codearena.backend.submission.Verdict;
import com.codearena.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLeaderboard(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<Map<String, Object>> leaderboard = userRepository.findAll().stream()
                .map(user -> {
                    long solved = submissionRepository
                            .findByUserIdOrderBySubmittedAtDesc(
                                    user.getId(),
                                    PageRequest.of(0, 1000))
                            .stream()
                            .filter(s -> s.getVerdict() == Verdict.ACCEPTED)
                            .map(s -> s.getProblem().getId())
                            .distinct()
                            .count();

                    Map<String, Object> entry = new HashMap<>();
                    entry.put("username",
                            user.getActualUsername());
                    entry.put("solved", solved);
                    entry.put("memberSince",
                            user.getCreatedAt());
                    return entry;
                })
                .sorted((a, b) -> Long.compare(
                        (Long) b.get("solved"),
                        (Long) a.get("solved")))
                .skip((long) page * size)
                .limit(size)
                .collect(Collectors.toList());

        // Add rank
        for (int i = 0; i < leaderboard.size(); i++) {
            leaderboard.get(i).put("rank",
                    (long) page * size + i + 1);
        }

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Leaderboard fetched successfully",
                        leaderboard));
    }
}