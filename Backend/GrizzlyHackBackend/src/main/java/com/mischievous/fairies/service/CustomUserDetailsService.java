package com.mischievous.fairies.service;

import com.mischievous.fairies.security.model.CustomUserDetails;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username)  {
        if (username.equals("ali")) {
            UserDetails details = new CustomUserDetails("ali", "password");
            return details;
        }
        return null;
    }
}
