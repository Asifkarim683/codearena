package com.codearena.backend.contest;

import com.codearena.backend.problem.Problem;
import com.codearena.backend.problem.ProblemRepository;
import com.codearena.backend.problem.ProblemResponse;
import com.codearena.backend.submission.SubmissionRepository;
import com.codearena.backend.user.User;
import com.codearena.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ContestService {

        private final ContestRepository contestRepository;
        private final ProblemRepository problemRepository;
        private final UserRepository userRepository;
        // Add this with the other repositories
        private final SubmissionRepository submissionRepository;

        // Get all contests
        public List<ContestResponse> getAllContests() {
                LocalDateTime now = LocalDateTime.now();
                List<Contest> all = new ArrayList<>();
                all.addAll(contestRepository.findUpcomingAndOngoing(now));
                all.addAll(contestRepository.findEnded(now));
                return all.stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        // Get single contest
        public ContestResponse getContestById(Long id) {
                Contest contest = contestRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Contest not found"));
                if (!contest.isActive()) {
                        throw new RuntimeException("Contest not found");
                }
                return mapToResponse(contest);
        }

        // Create contest (Admin)
        @Transactional
        public ContestResponse createContest(
                        ContestRequest request) {
                String email = SecurityContextHolder.getContext()
                                .getAuthentication().getName();
                User admin = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException(
                                                "User not found"));

                Contest contest = Contest.builder()
                                .title(request.getTitle())
                                .description(request.getDescription())
                                .startTime(request.getStartTime())
                                .endTime(request.getEndTime())
                                .createdBy(admin)
                                .build();

                // Add problems if provided
                if (request.getProblemIds() != null) {
                        List<Problem> problems = problemRepository
                                        .findAllById(request.getProblemIds());
                        contest.setProblems(problems);
                }

                return mapToResponse(contestRepository.save(contest));
        }

        private static class ScoreEntry {
                String username;
                int score = 0;
                int solvedCount = 0;
                java.util.Set<Long> solvedProblemIds = new java.util.HashSet<>();
                java.time.LocalDateTime lastSubmissionTime;
        }

        // Get contest scoreboard
        public List<Map<String, Object>> getScoreboard(Long contestId) {
                Contest contest = contestRepository.findById(contestId)
                                .orElseThrow(() -> new RuntimeException("Contest not found"));

                List<com.codearena.backend.submission.Submission> contestSubmissions = submissionRepository
                                .findByContestId(contestId);

                // Group by user
                Map<Long, Map<String, Object>> userScores = new java.util.HashMap<>();

                for (com.codearena.backend.submission.Submission sub : contestSubmissions) {
                        if (sub.getVerdict() != com.codearena.backend.submission.Verdict.ACCEPTED) {
                                continue;
                        }
                        if (sub.getUser().getRole() == com.codearena.backend.user.Role.ADMIN) {
                                continue;
                        }

                        Long userId = sub.getUser().getId();
                        Long problemId = sub.getProblem().getId();

                        userScores.putIfAbsent(userId, new java.util.HashMap<>());
                        Map<String, Object> entry = userScores.get(userId);

                        @SuppressWarnings("unchecked")
                        java.util.Set<Long> solvedProblems = (java.util.Set<Long>) entry
                                        .computeIfAbsent("solvedProblemIds", k -> new java.util.HashSet<Long>());

                        // Only count first accepted submission per problem
                        if (!solvedProblems.contains(problemId)) {
                                solvedProblems.add(problemId);

                                int currentScore = (int) entry.getOrDefault("score", 0);
                                entry.put("score", currentScore + sub.getProblem().getPoints());

                                int currentSolved = (int) entry.getOrDefault("solvedCount", 0);
                                entry.put("solvedCount", currentSolved + 1);

                                // Track last accepted submission time (for tiebreaker)
                                java.time.LocalDateTime lastTime = (java.time.LocalDateTime) entry
                                                .get("lastSubmissionTime");
                                if (lastTime == null || sub.getSubmittedAt().isAfter(lastTime)) {
                                        entry.put("lastSubmissionTime", sub.getSubmittedAt());
                                }
                        }

                        entry.put("username", sub.getUser().getActualUsername());
                }

                // Build final list
                List<Map<String, Object>> scoreboard = new ArrayList<>();
                for (Map<String, Object> entry : userScores.values()) {
                        Map<String, Object> row = new java.util.HashMap<>();
                        row.put("username", entry.get("username"));
                        row.put("score", entry.getOrDefault("score", 0));
                        row.put("solvedCount", entry.getOrDefault("solvedCount", 0));
                        row.put("totalProblems", contest.getProblems().size());
                        row.put("lastSubmissionTime", entry.get("lastSubmissionTime"));
                        scoreboard.add(row);
                }

                // Sort by score desc, then by lastSubmissionTime asc (earlier = better)
                scoreboard.sort((a, b) -> {
                        int scoreCompare = Integer.compare(
                                        (int) b.get("score"), (int) a.get("score"));
                        if (scoreCompare != 0)
                                return scoreCompare;

                        java.time.LocalDateTime timeA = (java.time.LocalDateTime) a.get("lastSubmissionTime");
                        java.time.LocalDateTime timeB = (java.time.LocalDateTime) b.get("lastSubmissionTime");
                        if (timeA == null)
                                return 1;
                        if (timeB == null)
                                return -1;
                        return timeA.compareTo(timeB);
                });

                // Add rank
                for (int i = 0; i < scoreboard.size(); i++) {
                        scoreboard.get(i).put("rank", i + 1);
                }

                return scoreboard;
        }

        // Join contest
        @Transactional
        public ContestResponse joinContest(Long contestId) {
                String email = SecurityContextHolder.getContext()
                                .getAuthentication().getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException(
                                                "User not found"));

                Contest contest = contestRepository
                                .findById(contestId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Contest not found"));

                if (contest.getStatus() == ContestStatus.ENDED) {
                        throw new RuntimeException(
                                        "Contest has already ended");
                }

                if (!contest.getParticipants().contains(user)) {
                        contest.getParticipants().add(user);
                        contestRepository.save(contest);
                }

                return mapToResponse(contest);
        }

        // Delete contest (Admin)
        @Transactional
        public void deleteContest(Long id) {
                Contest contest = contestRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Contest not found"));
                contest.setActive(false);
                contestRepository.save(contest);
        }

        // Map Contest to ContestResponse
        private ContestResponse mapToResponse(Contest contest) {
                List<ProblemResponse> problemResponses = null;

                // Only show problems if contest is ongoing or ended
                if (contest.getStatus() != ContestStatus.UPCOMING) {
                        problemResponses = contest.getProblems()
                                        .stream()
                                        .map(p -> ProblemResponse.builder()
                                                        .id(p.getId())
                                                        .title(p.getTitle())
                                                        .difficulty(p.getDifficulty())
                                                        .build())
                                        .collect(Collectors.toList());
                }

                return ContestResponse.builder()
                                .id(contest.getId())
                                .title(contest.getTitle())
                                .description(contest.getDescription())
                                .startTime(contest.getStartTime())
                                .endTime(contest.getEndTime())
                                .status(contest.getStatus())
                                .totalParticipants(
                                                contest.getParticipants().size())
                                .totalProblems(contest.getProblems().size())
                                .problems(problemResponses)
                                .createdAt(contest.getCreatedAt())
                                .build();
        }
}