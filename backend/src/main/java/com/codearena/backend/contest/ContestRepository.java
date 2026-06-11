package com.codearena.backend.contest;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ContestRepository
                extends JpaRepository<Contest, Long> {

        @Query("SELECT c FROM Contest c WHERE c.endTime > :now " +
                        "AND c.active = true ORDER BY c.startTime ASC")
        List<Contest> findUpcomingAndOngoing(LocalDateTime now);

        @Query("SELECT c FROM Contest c WHERE c.endTime < :now " +
                        "AND c.active = true ORDER BY c.endTime DESC")
        List<Contest> findEnded(LocalDateTime now);
}