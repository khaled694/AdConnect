package com.khaled.adconnect.config;

import com.khaled.adconnect.security.CustomUserDetailsService;
import com.khaled.adconnect.security.JwtAuthenticationFilter;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            AuthenticationProvider authenticationProvider
    ) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/categories/**",
                                "/api/youtubers/**",
                                "/api/campaigns/**",
                                "/api/companies/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/users/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/categories").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/youtubers").hasAnyAuthority("ROLE_YOUTUBER", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/youtubers/**").hasAnyAuthority("ROLE_YOUTUBER", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/youtubers/**").hasAnyAuthority("ROLE_YOUTUBER", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/requests/*/accept").hasAnyAuthority("ROLE_YOUTUBER", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/requests/*/reject").hasAnyAuthority("ROLE_YOUTUBER", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/companies").hasAnyAuthority("ROLE_COMPANY", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/companies/**").hasAnyAuthority("ROLE_COMPANY", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/companies/**").hasAnyAuthority("ROLE_COMPANY", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/campaigns").hasAnyAuthority("ROLE_COMPANY", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/campaigns/**").hasAnyAuthority("ROLE_COMPANY", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/campaigns/**").hasAnyAuthority("ROLE_COMPANY", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/requests").hasAnyAuthority("ROLE_COMPANY", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/requests/**").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
            CustomUserDetailsService customUserDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider(customUserDetailsService);
        authenticationProvider.setPasswordEncoder(passwordEncoder);
        return authenticationProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
