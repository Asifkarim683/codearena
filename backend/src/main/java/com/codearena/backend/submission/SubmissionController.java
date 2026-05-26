package com.codearena.backend.submission;

import com.codearena.backend.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    // Submit code for judging
    @PostMapping
    public ResponseEntity<ApiResponse<SubmissionResponse>> submit(
            @Valid @RequestBody SubmissionRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Code submitted successfully",
                        submissionService.submit(request)));
    }

    // Run code against sample test cases
    @PostMapping("/run")
    public ResponseEntity<ApiResponse<SubmissionResponse>> run(
            @Valid @RequestBody SubmissionRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Code executed successfully",
                        submissionService.run(request)));
    }

    // Get submission by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubmissionResponse>> getSubmission(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Submission fetched successfully",
                        submissionService.getSubmissionById(id)));
    }

    // Get my submissions
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<SubmissionResponse>>> getMySubmissions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Submissions fetched successfully",
                        submissionService.getMySubmissions(
                                page, size)));
    }

    // Get my submissions for a specific problem
    @GetMapping("/problem/{problemId}")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getMySubmissionsForProblem(
            @PathVariable Long problemId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Submissions fetched successfully",
                        submissionService
                                .getMySubmissionsForProblem(
                                        problemId)));
    }
}