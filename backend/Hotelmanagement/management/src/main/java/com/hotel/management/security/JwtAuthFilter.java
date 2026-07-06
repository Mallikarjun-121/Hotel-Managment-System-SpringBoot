package com.hotel.management.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
// OncePerRequestFilter = runs exactly once per HTTP request
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // 1. Read Authorization header
        final String authHeader = request.getHeader("Authorization");

        // 2. If no token or wrong format → skip this filter
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract token (remove "Bearer " prefix)
        final String jwt = authHeader.substring(7);

        try {
            // 4. Extract email from token
            final String userEmail = jwtUtil.extractUsername(jwt);

            // 5. If email found AND user not already authenticated
            if (userEmail != null &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                // 6. Load user from DB
                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(userEmail);

                // 7. Validate token
                if (jwtUtil.validateToken(jwt, userDetails)) {

                    // 8. Create authentication object with roles
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,                          // credentials (not needed)
                                    userDetails.getAuthorities()   // roles
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request));

                    // 9. Tell Spring Security this user is authenticated
                    SecurityContextHolder.getContext()
                            .setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Invalid token — just continue without setting authentication
            // Spring Security will reject the request as unauthorized
        }

        // 10. Continue to next filter / controller
        filterChain.doFilter(request, response);
    }
}