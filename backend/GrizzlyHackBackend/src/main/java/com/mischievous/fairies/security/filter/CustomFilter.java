package com.mischievous.fairies.security.filter;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.filter.OncePerRequestFilter;

import java.util.HashSet;
import java.util.Set;

public abstract class CustomFilter extends OncePerRequestFilter {
    protected final Set<String> publicUrls;
    protected AuthenticationManager authenticationManager;
    protected UserDetailsService userDetailsService;

    public CustomFilter(AuthenticationManager authenticationManager, UserDetailsService userDetailsService) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        publicUrls = getPublicUrls();
    }

    private Set<String> getPublicUrls() {
        Set<String> urls = new HashSet<String>();
        urls.add("/login");
        urls.add("/signup");
        return urls;
    }
}