package com.codearena.backend.submission;

import com.codearena.backend.problem.Problem;
import com.codearena.backend.problem.ProblemRepository;
import com.codearena.backend.problem.TestCase;
import com.codearena.backend.problem.TestCaseRepository;
import com.codearena.backend.user.User;
import com.codearena.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final UserRepository userRepository;
    private final JudgeService judgeService;

    @Transactional
    public SubmissionResponse submit(SubmissionRequest request) {

        // Get current user
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get problem
        Problem problem = problemRepository
                .findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        // Get all test cases for this problem
        List<TestCase> testCases = testCaseRepository
                .findByProblemId(problem.getId());

        if (testCases.isEmpty()) {
            throw new RuntimeException(
                    "No test cases found for this problem");
        }

        // Save submission as PENDING first
        Submission submission = Submission.builder()
                .user(user)
                .problem(problem)
                .language(request.getLanguage())
                .code(request.getCode())
                .verdict(Verdict.PENDING)
                .build();
        submission = submissionRepository.save(submission);

        // Run judge
        JudgeResult result = judgeService.judge(
                request.getCode(),
                request.getLanguage(),
                testCases,
                problem.getTimeLimit(),
                problem.getMemoryLimit());

        // Update submission with result
        submission.setVerdict(result.getVerdict());
        submission.setRuntimeMs(result.getRuntimeMs());
        submission.setMemoryKb(result.getMemoryKb());
        submission.setErrorMessage(result.getErrorMessage());
        submissionRepository.save(submission);

        // Update problem stats
        problem.setTotalSubmissions(
                problem.getTotalSubmissions() + 1);
        if (result.getVerdict() == Verdict.ACCEPTED) {
            problem.setAcceptedSubmissions(
                    problem.getAcceptedSubmissions() + 1);
        }
        problemRepository.save(problem);

        return mapToResponse(submission);
    }

    // Run code against sample test cases only
    public SubmissionResponse run(SubmissionRequest request) {

        Problem problem = problemRepository
                .findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        List<TestCase> sampleTestCases = testCaseRepository
                .findByProblemIdAndIsSampleTrue(problem.getId());

        if (sampleTestCases.isEmpty()) {
            throw new RuntimeException(
                    "No sample test cases found");
        }

        JudgeResult result = judgeService.judge(
                request.getCode(),
                request.getLanguage(),
                sampleTestCases,
                problem.getTimeLimit(),
                problem.getMemoryLimit());

        return SubmissionResponse.builder()
                .problemId(problem.getId())
                .problemTitle(problem.getTitle())
                .language(request.getLanguage())
                .verdict(result.getVerdict())
                .runtimeMs(result.getRuntimeMs())
                .errorMessage(result.getErrorMessage())
                .build();
    }

    // Get submission by ID
    public SubmissionResponse getSubmissionById(Long id) {
        Submission submission = submissionRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Submission not found"));
        return mapToResponse(submission);
    }

    // Get current user's submissions
    public Page<SubmissionResponse> getMySubmissions(
            int page, int size) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size);
        return submissionRepository
                .findByUserIdOrderBySubmittedAtDesc(
                        user.getId(), pageable)
                .map(this::mapToResponse);
    }

    // Get user's submissions for a specific problem
    public List<SubmissionResponse> getMySubmissionsForProblem(
            Long problemId) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return submissionRepository
                .findByUserIdAndProblemIdOrderBySubmittedAtDesc(
                        user.getId(), problemId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Map Submission to SubmissionResponse
    private SubmissionResponse mapToResponse(
            Submission submission) {
        return SubmissionResponse.builder()
                .id(submission.getId())
                .problemId(submission.getProblem().getId())
                .problemTitle(submission.getProblem().getTitle())
                .username(submission.getUser().getActualUsername())
                .language(submission.getLanguage())
                .verdict(submission.getVerdict())
                .runtimeMs(submission.getRuntimeMs())
                .memoryKb(submission.getMemoryKb())
                .errorMessage(submission.getErrorMessage())
                .code(submission.getCode())
                .submittedAt(submission.getSubmittedAt())
                .build();
    }
}