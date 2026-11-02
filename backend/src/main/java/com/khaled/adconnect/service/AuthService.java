package com.khaled.adconnect.service;

import com.khaled.adconnect.dto.AuthResponse;
import com.khaled.adconnect.dto.LoginRequest;
import com.khaled.adconnect.dto.RegisterRequest;
import com.khaled.adconnect.enums.Role;
import com.khaled.adconnect.exception.BadRequestException;
import com.khaled.adconnect.exception.ConflictException;
import com.khaled.adconnect.exception.ResourceNotFoundException;
import com.khaled.adconnect.model.User;
import com.khaled.adconnect.repository.UserRepository;
import com.khaled.adconnect.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("User with this username already exists.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("User with this email already exists.");
        }

        // Only YouTuber and Company accounts can self-register.
        // Admin accounts are created directly in the database (see README).
        if (request.getRole() == null || request.getRole() == Role.ROLE_ADMIN) {
            throw new BadRequestException("Role must be ROLE_YOUTUBER or ROLE_COMPANY.");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        User savedUser = userRepository.save(user);
        return toAuthResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (AuthenticationException exception) {
            throw new BadRequestException("Invalid username or password.");
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User with username " + request.getUsername() + " was not found."));

        return toAuthResponse(user);
    }

    private AuthResponse toAuthResponse(User user) {
        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole()
        );
    }
}
