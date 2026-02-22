package com.mischievous.fairies.service;

import com.mischievous.fairies.model.entity.UserEntity;
import com.mischievous.fairies.repository.UserRepository;
import com.mischievous.fairies.security.model.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Autowired
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username)  {
        Optional<UserEntity> userEntityOptional = userRepository.findByUsername(username);
        UserEntity userEntity = userEntityOptional.get();
        UserDetails details = new CustomUserDetails(userEntity.getUsername(), userEntity.getPasswordHash());
        return details;
    }
}
