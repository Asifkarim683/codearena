package com.codearena.backend.problem;

import com.codearena.backend.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    // Public - Get all problems
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProblemResponse>>> getProblems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(
                ApiResponse.success("Problems fetched successfully",
                        problemService.getProblems(
                                page, size, difficulty, keyword)));
    }

    // Public - Get single problem
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProblemResponse>> getProblem(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Problem fetched successfully",
                        problemService.getProblemById(id)));
    }

    // Admin - Create problem
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProblemResponse>> createProblem(
            @Valid @RequestBody ProblemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Problem created successfully",
                        problemService.createProblem(request)));
    }

    // Admin - Update problem
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProblemResponse>> updateProblem(
            @PathVariable Long id,
            @Valid @RequestBody ProblemRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Problem updated successfully",
                        problemService.updateProblem(id, request)));
    }

    // Admin - Delete problem
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProblem(
            @PathVariable Long id) {
        problemService.deleteProblem(id);
        return ResponseEntity.ok(
                ApiResponse.success("Problem deleted successfully",
                        null));
    }

    // Admin - Add test case
    @PostMapping("/{id}/testcases")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TestCaseResponse>> addTestCase(
            @PathVariable Long id,
            @Valid @RequestBody TestCaseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Test case added successfully",
                        problemService.addTestCase(id, request)));
    }

    // Public - Get all tags
    @GetMapping("/tags")
    public ResponseEntity<ApiResponse<List<Tag>>> getTags() {
        return ResponseEntity.ok(
                ApiResponse.success("Tags fetched successfully",
                        problemService.getAllTags()));
    }
}