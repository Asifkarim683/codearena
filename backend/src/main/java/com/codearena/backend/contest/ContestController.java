package com.codearena.backend.contest;

import com.codearena.backend.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/contests")
@RequiredArgsConstructor
public class ContestController {

    private final ContestService contestService;

    // Public - Get all contests
    @GetMapping
    public ResponseEntity<ApiResponse<List<ContestResponse>>> getAllContests() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Contests fetched successfully",
                        contestService.getAllContests()));
    }

    // Public - Get single contest
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContestResponse>> getContest(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Contest fetched successfully",
                        contestService.getContestById(id)));
    }

    // Admin - Create contest
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ContestResponse>> createContest(
            @Valid @RequestBody ContestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Contest created successfully",
                        contestService.createContest(
                                request)));
    }

    // User - Join contest
    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<ContestResponse>> joinContest(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Joined contest successfully",
                        contestService.joinContest(id)));
    }

    // Admin - Delete contest
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteContest(
            @PathVariable Long id) {
        contestService.deleteContest(id);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Contest deleted successfully",
                        null));
    }
}