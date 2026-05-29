package com.codearena.backend.contest;

import com.codearena.backend.problem.Problem;
import com.codearena.backend.problem.ProblemRepository;
import com.codearena.backend.problem.ProblemResponse;
import com.codearena.backend.user.User;
import com.codearena.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContestService {

    private final ContestRepository contestRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;

    // Get all contests
    public List<ContestResponse> getAllContests() {
        return contestRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get single contest
    public ContestResponse getContestById(Long id) {
        Contest contest = contestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Contest not found"));
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