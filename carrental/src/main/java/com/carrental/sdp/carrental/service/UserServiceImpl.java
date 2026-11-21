package com.carrental.sdp.carrental.service;

import com.carrental.sdp.carrental.dto.BookingResponseDto;
import com.carrental.sdp.carrental.dto.ProfileUpdateResponse;
import com.carrental.sdp.carrental.dto.UserResponseDto;
import com.carrental.sdp.carrental.dto.UserSummaryWithBookingsDto;
import com.carrental.sdp.carrental.dto.UserUpdateRequest;
import com.carrental.sdp.carrental.model.Booking;
import com.carrental.sdp.carrental.model.Role;
import com.carrental.sdp.carrental.model.User;
import com.carrental.sdp.carrental.repository.BookingRepository;
import com.carrental.sdp.carrental.repository.PasswordResetTokenRepository;
import com.carrental.sdp.carrental.repository.ReviewRepository;
import com.carrental.sdp.carrental.repository.UserRepository;
import com.carrental.sdp.carrental.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JwtUtil jwtUtil;

    @Override
    public UserResponseDto getCurrentUser(User user) {
        return UserResponseDto.from(user);
    }

    @Override
    public List<BookingResponseDto> getUserBookings(User user) {
        List<Booking> bookings = bookingRepository.findAll().stream()
                .filter(b -> b.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());
        return bookings.stream().map(BookingResponseDto::from).collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream().map(UserResponseDto::from).collect(Collectors.toList());
    }

    @Override
    public UserSummaryWithBookingsDto getUserSummaryWithBookings(User user) {
        UserSummaryWithBookingsDto dto = new UserSummaryWithBookingsDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setBookings(getUserBookings(user));
        return dto;
    }

    @Override
    @Transactional
    public ProfileUpdateResponse updateProfile(User currentUser, UserUpdateRequest request) {
        User user = findUser(currentUser.getId());
        boolean emailChanged = applyNameAndEmail(user, request);
        User saved = userRepository.save(user);
        // The JWT subject is the email, so the old token stops matching once the email changes.
        String newToken = emailChanged ? jwtUtil.generateToken(saved) : null;
        return new ProfileUpdateResponse(UserResponseDto.from(saved), newToken);
    }

    @Override
    @Transactional
    public UserResponseDto updateUser(Long userId, UserUpdateRequest request) {
        User user = findUser(userId);
        applyNameAndEmail(user, request);
        return UserResponseDto.from(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponseDto updateRole(Long userId, Role role, User admin) {
        if (admin.getId().equals(userId)) {
            // Stops an admin from removing their own admin access by accident.
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot change your own role.");
        }
        User user = findUser(userId);
        user.setRole(role);
        return UserResponseDto.from(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long userId, User admin) {
        if (admin.getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot delete your own account.");
        }
        User user = findUser(userId);
        if (bookingRepository.existsByUser(user)) {
            // Bookings and payments are financial history; they must not disappear with the user.
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This user has bookings and cannot be deleted.");
        }
        passwordResetTokenRepository.deleteByUser(user);
        reviewRepository.deleteByUser(user);
        userRepository.delete(user);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
    }

    /**
     * Applies name and email, rejecting an email that belongs to another account.
     *
     * @return true if the stored email text changed (a new login token is then needed)
     */
    private boolean applyNameAndEmail(User user, UserUpdateRequest request) {
        String oldEmail = user.getEmail();
        String newEmail = request.getEmail().trim();

        boolean differentAddress = !newEmail.equalsIgnoreCase(oldEmail);
        if (differentAddress && userRepository.findByEmail(newEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That email is already in use.");
        }

        user.setName(request.getName().trim());
        user.setEmail(newEmail);
        return !newEmail.equals(oldEmail);
    }
}
