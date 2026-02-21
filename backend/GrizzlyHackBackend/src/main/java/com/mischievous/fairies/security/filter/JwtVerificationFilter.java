package com.mischievous.fairies.security.filter;

import com.mischievous.fairies.security.model.JwtUser;
import com.mischievous.fairies.security.service.CustomUserDetailsService;
import com.mischievous.fairies.security.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtVerificationFilter extends CustomFilter {
    private JwtService jwtService;

    @Autowired
    public JwtVerificationFilter(JwtService jwtService, AuthenticationManager authenticationManager,
                                 CustomUserDetailsService userDetailsService) {
        super(authenticationManager, userDetailsService);
        this.jwtService = jwtService;
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if (publicUrls.contains(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }
        String jwt = getJwtFromRequest(request);
        if (jwt != null && !jwtService.isExpired(jwt)) {
            createAuth(jwt);
            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("Missing or invalid JWT token");
    }

    private void createAuth(String jwt) {
        JwtUser jwtUser = jwtService.extractUserData(jwt);
        String username = jwtUser.getUsername();
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if (userDetails != null && username.equals(userDetails.getUsername())) {
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (cookie != null && cookie.getName().equals("access_token")) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
