package com.khaled.adconnect.service;

import com.khaled.adconnect.dto.UserRequest;
import com.khaled.adconnect.dto.UserResponse;
import com.khaled.adconnect.exception.ConflictException;
import com.khaled.adconnect.exception.ResourceNotFoundException;
import com.khaled.adconnect.model.User;
import com.khaled.adconnect.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse getUserById(Long id) {
        User user = findUserById(id);
        return toResponse(user);
    }

    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("User with this username already exists.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("User with this email already exists.");
        }

        User user = new User();
        updateUserFromRequest(user, request);

        return toResponse(userRepository.save(user));
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User with id " + id + " was not found."));
    }

    private void updateUserFromRequest(User user, UserRequest request) {
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
