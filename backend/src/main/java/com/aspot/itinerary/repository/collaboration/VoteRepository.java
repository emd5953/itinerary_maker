package com.aspot.itinerary.repository.collaboration;

import com.aspot.itinerary.model.collaboration.Proposal;
import com.aspot.itinerary.model.collaboration.Vote;
import com.aspot.itinerary.model.enums.VoteType;
import com.aspot.itinerary.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VoteRepository extends JpaRepository<Vote, UUID> {
    List<Vote> findByProposal(Proposal proposal);
    Optional<Vote> findByProposalAndVoter(Proposal proposal, User voter);
    
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.proposal = :proposal AND v.voteType = :voteType")
    long countByProposalAndVoteType(@Param("proposal") Proposal proposal, @Param("voteType") VoteType voteType);
    
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.proposal = :proposal")
    long countByProposal(@Param("proposal") Proposal proposal);
}