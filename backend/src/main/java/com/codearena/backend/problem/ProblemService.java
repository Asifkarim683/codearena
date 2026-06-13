package com.codearena.backend.problem;

import com.codearena.backend.user.User;
import com.codearena.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProblemService {

        private final ProblemRepository problemRepository;
        private final TagRepository tagRepository;
        private final TestCaseRepository testCaseRepository;
        private final UserRepository userRepository;

        // Get all problems with filters
        public Page<ProblemResponse> getProblems(
                        int page, int size,
                        String difficulty, String keyword) {

                Pageable pageable = PageRequest.of(
                                page, size, Sort.by("createdAt").descending());

                Difficulty diff = null;
                if (difficulty != null && !difficulty.isEmpty()) {
                        diff = Difficulty.valueOf(difficulty.toUpperCase());
                }

                Page<Problem> problems = problemRepository
                                .findWithFilters(diff, keyword, pageable);

                return problems.map(this::mapToResponse);
        }

        // Get single problem by ID
        public ProblemResponse getProblemById(Long id) {
                Problem problem = problemRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Problem not found"));
                return mapToResponse(problem);
        }

        // Create new problem (Admin only)
        @Transactional
        public ProblemResponse createProblem(ProblemRequest request) {
                String email = SecurityContextHolder.getContext()
                                .getAuthentication().getName();
                User admin = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // Resolve tags
                Set<Tag> tags = resolveTags(request.getTags());

                Problem problem = Problem.builder()
                                .title(request.getTitle())
                                .description(request.getDescription())
                                .constraints(request.getConstraints())
                                .difficulty(request.getDifficulty())
                                .timeLimit(request.getTimeLimit() > 0
                                                ? request.getTimeLimit()
                                                : 2000)
                                .memoryLimit(request.getMemoryLimit() > 0
                                                ? request.getMemoryLimit()
                                                : 256)
                                .tags(tags)
                                .createdBy(admin)
                                .build();

                return mapToResponse(problemRepository.save(problem));
        }

        // Update problem (Admin only)
        @Transactional
        public ProblemResponse updateProblem(Long id,
                        ProblemRequest request) {
                Problem problem = problemRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Problem not found"));

                problem.setTitle(request.getTitle());
                problem.setDescription(request.getDescription());
                problem.setConstraints(request.getConstraints());
                problem.setDifficulty(request.getDifficulty());
                if (request.getTimeLimit() > 0)
                        problem.setTimeLimit(request.getTimeLimit());
                if (request.getMemoryLimit() > 0)
                        problem.setMemoryLimit(request.getMemoryLimit());
                problem.setTags(resolveTags(request.getTags()));

                return mapToResponse(problemRepository.save(problem));
        }

        // Delete problem (Admin only)
        @Transactional
        public void deleteProblem(Long id) {
                Problem problem = problemRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Problem not found"));
                problem.setActive(false);
                problemRepository.save(problem);
        }

        // Add test case to problem (Admin only)
        @Transactional
        public TestCaseResponse addTestCase(Long problemId,
                        TestCaseRequest request) {
                Problem problem = problemRepository.findById(problemId)
                                .orElseThrow(() -> new RuntimeException("Problem not found"));

                TestCase testCase = TestCase.builder()
                                .problem(problem)
                                .input(request.getInput())
                                .expectedOutput(request.getExpectedOutput())
                                .isSample(request.isSample())
                                .orderIndex(request.getOrderIndex())
                                .build();

                return mapToTestCaseResponse(
                                testCaseRepository.save(testCase));
        }

        // Get all tags
        public List<Tag> getAllTags() {
                return tagRepository.findAll();
        }

        // Helper - resolve tags from names
        private Set<Tag> resolveTags(Set<String> tagNames) {
                Set<Tag> tags = new HashSet<>();
                if (tagNames == null)
                        return tags;
                for (String name : tagNames) {
                        Tag tag = tagRepository.findByName(name)
                                        .orElseGet(() -> tagRepository.save(
                                                        Tag.builder().name(name).build()));
                        tags.add(tag);
                }
                return tags;
        }

        // Helper - map Problem to ProblemResponse
        private ProblemResponse mapToResponse(Problem problem) {
                List<TestCaseResponse> sampleTestCases = problem
                                .getTestCases().stream()
                                .filter(TestCase::isSample)
                                .map(this::mapToTestCaseResponse)
                                .collect(Collectors.toList());

                Set<String> tagNames = problem.getTags().stream()
                                .map(Tag::getName)
                                .collect(Collectors.toSet());

                double acceptanceRate = problem.getTotalSubmissions() > 0
                                ? (double) problem.getAcceptedSubmissions()
                                                / problem.getTotalSubmissions() * 100
                                : 0.0;

                return ProblemResponse.builder()
                                .id(problem.getId())
                                .title(problem.getTitle())
                                .description(problem.getDescription())
                                .constraints(problem.getConstraints())
                                .difficulty(problem.getDifficulty())
                                .timeLimit(problem.getTimeLimit())
                                .memoryLimit(problem.getMemoryLimit())
                                .tags(tagNames)
                                .sampleTestCases(sampleTestCases)
                                .totalSubmissions(problem.getTotalSubmissions())
                                .acceptedSubmissions(problem.getAcceptedSubmissions())
                                .acceptanceRate(acceptanceRate)
                                .createdAt(problem.getCreatedAt())
                                .points(problem.getPoints())
                                .build();
        }

        // Helper - map TestCase to TestCaseResponse
        private TestCaseResponse mapToTestCaseResponse(TestCase tc) {
                return TestCaseResponse.builder()
                                .id(tc.getId())
                                .input(tc.getInput())
                                .expectedOutput(tc.getExpectedOutput())
                                .isSample(tc.isSample())
                                .orderIndex(tc.getOrderIndex())
                                .build();
        }
}