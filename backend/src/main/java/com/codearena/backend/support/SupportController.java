package com.codearena.backend.support;

import com.codearena.backend.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/support")
@RequiredArgsConstructor
public class SupportController {

    private final SupportTicketRepository supportTicketRepository;

    // Public - Anyone can submit a ticket
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> submitTicket(
            @Valid @RequestBody SupportRequest request) {

        SupportTicket ticket = SupportTicket.builder()
                .name(request.getName())
                .email(request.getEmail())
                .subject(request.getSubject())
                .message(request.getMessage())
                .build();

        supportTicketRepository.save(ticket);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Your message has been sent. We will get back to you shortly.",
                        null));
    }

    // Admin - Get all tickets
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<SupportTicket>>> getAllTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "ALL") String status) {

        PageRequest pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());

        Page<SupportTicket> tickets;
        if ("OPEN".equals(status)) {
            tickets = supportTicketRepository
                    .findByStatusOrderByCreatedAtDesc(
                            TicketStatus.OPEN, pageable);
        } else if ("RESOLVED".equals(status)) {
            tickets = supportTicketRepository
                    .findByStatusOrderByCreatedAtDesc(
                            TicketStatus.RESOLVED, pageable);
        } else {
            tickets = supportTicketRepository
                    .findAllByOrderByCreatedAtDesc(pageable);
        }

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Tickets fetched successfully", tickets));
    }

    // Admin - Resolve a ticket
    @PutMapping("/admin/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> resolveTicket(
            @PathVariable Long id) {

        SupportTicket ticket = supportTicketRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Ticket not found"));

        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolvedAt(LocalDateTime.now());
        supportTicketRepository.save(ticket);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Ticket resolved successfully", null));
    }

    // Admin - Get open ticket count (for dashboard badge)
    @GetMapping("/admin/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getOpenCount() {
        long count = supportTicketRepository
                .countByStatus(TicketStatus.OPEN);
        return ResponseEntity.ok(
                ApiResponse.success("Count fetched", count));
    }
}